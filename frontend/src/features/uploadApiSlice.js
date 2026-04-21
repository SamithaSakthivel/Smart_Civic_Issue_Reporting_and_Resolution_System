import { apiSlice } from "../app/api/apiSlice";

export const uploadsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadPhoto: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append("photo", file);

        return {
          url: "/uploads/photo",
          method: "POST",
          body: formData,
        };
      },
    }),
  }),
});

export const { useUploadPhotoMutation } = uploadsApiSlice;