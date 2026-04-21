const { GoogleGenAI, Type, Schema } = require('@google/genai');
const Complaint = require('../models/Complaint');
const fs = require('fs');
const path = require('path');

// We will initialize Gemini dynamically so it doesn't crash the server on startup if the key is missing
let ai = null;
const getAiInstance = () => {
  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
};

const verifyPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
    const mimeType = req.file.mimetype;
    const fileBytes = fs.readFileSync(filePath).toString("base64");

    const prompt = `You are a strict civic issue verification AI. 
Analyze the provided image. Does it depict a GENUINE civic or public infrastructure issue (e.g., pothole, broken streetlight, garbage dump, broken water pipe, hazard, fallen tree)? 
You MUST reject the image if it is:
1. A fake, mock, meme, or blank image.
2. An unrelated stock photo.
3. A certificate, course image (like NPTEL), document, or screenshot of text.
4. An image of random food, a selfie, or an indoor setting that is clearly not a civic issue.

Respond strictly in JSON format matching the schema.`;

    const aiInstance = getAiInstance();
    if (!aiInstance) throw new Error("Missing GEMINI_API_KEY");

    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: fileBytes,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isRealIssue: { type: Type.BOOLEAN, description: "True if it's a real civic issue, false otherwise" },
            reason: { type: Type.STRING, description: "Short explanation for your decision" }
          },
          required: ["isRealIssue", "reason"]
        }
      }
    });

    const result = JSON.parse(response.text);
    res.json(result);
  } catch (error) {
    console.error('verifyPhoto error:', error);
    res.status(500).json({
      message: 'Error verifying photo',
      isRealIssue: false,
      reason: !process.env.GEMINI_API_KEY ? 'Backend missing GEMINI_API_KEY' : 'AI Verification Failed (Server Error)'
    });
  }
};

const autoCategorize = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description || description.length < 10) {
      return res.json({ category: 'other', department: 'municipal', isEmergency: false });
    }

    const prompt = `You are an AI that categorizes civic complaints based on their description.
Description: "${description}"

Categories available: roads, sanitation, streetlights, water, safety, other
Departments available: municipal, electricity, waterboard, police
Is Emergency: true if it poses immediate danger to life or property (e.g. live wire, massive fire, deep open manhole), false otherwise.

Strictly categorize the issue. If the description is about food poisoning or hygiene at a restaurant, it falls under "sanitation" and "municipal". If it is about traffic, it falls under "roads". If it's unrelated to any civic issue, output "other".`;

    const aiInstance = getAiInstance();
    if (!aiInstance) throw new Error("Missing GEMINI_API_KEY");

    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: ["roads", "sanitation", "streetlights", "water", "safety", "other"] },
            department: { type: Type.STRING, enum: ["municipal", "electricity", "waterboard", "police"] },
            isEmergency: { type: Type.BOOLEAN }
          },
          required: ["category", "department", "isEmergency"]
        }
      }
    });

    const result = JSON.parse(response.text);
    res.json(result);
  } catch (error) {
    console.error('autoCategorize error:', error);
    res.status(500).json({
      category: 'other',
      department: 'municipal',
      isEmergency: false,
      error: !process.env.GEMINI_API_KEY ? 'Backend missing GEMINI_API_KEY' : 'AI Error'
    });
  }
};

const checkDuplicates = async (req, res) => {
  try {
    const { description, councilId } = req.body;

    // Fetch recent complaints in the same council
    const recentComplaints = await Complaint.find({
      councilId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      status: { $nin: ['cancelled', 'resolved'] }
    }).select('title description councilName photoUrl').limit(10).lean();

    if (recentComplaints.length === 0) {
      return res.json({ hasDuplicates: false, duplicates: [] });
    }

    const complaintsList = recentComplaints.map(c => ({
      id: c._id,
      title: c.title,
      description: c.description
    }));

    const prompt = `You are an AI that detects duplicate civic complaints.
A user is reporting a new issue:
"${description}"

Here are recently reported issues in the same area:
${JSON.stringify(complaintsList, null, 2)}

Does the new issue describe the EXACT SAME specific problem as any of the recently reported issues? (e.g. "pothole on 5th avenue" is the same as "broken road on 5th ave", but "pothole on 5th avenue" is NOT the same as "pothole on 6th avenue").
Only mark as duplicate if you are highly confident they refer to the exact same real-world issue instance.

Provide your response in JSON format.`;

    const aiInstance = getAiInstance();
    if (!aiInstance) throw new Error("Missing GEMINI_API_KEY");

    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hasDuplicates: { type: Type.BOOLEAN },
            duplicateId: { type: Type.STRING, description: "The ID of the duplicate issue, or empty string if none" },
            confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 1" }
          },
          required: ["hasDuplicates", "duplicateId"]
        }
      }
    });

    const result = JSON.parse(response.text);

    if (result.hasDuplicates && result.duplicateId) {
      const duplicateObj = recentComplaints.find(c => c._id.toString() === result.duplicateId);
      if (duplicateObj) {
        return res.json({
          hasDuplicates: true,
          duplicates: [{
            ...duplicateObj,
            similarity: result.confidence || 0.9
          }]
        });
      }
    }

    res.json({ hasDuplicates: false, duplicates: [] });
  } catch (error) {
    console.error('checkDuplicates error:', error);
    res.json({ hasDuplicates: false, duplicates: [] });
  }
};

module.exports = {
  verifyPhoto,
  autoCategorize,
  checkDuplicates
};
