import { apiSlice } from "../app/api/apiSlice";

export const complaintsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyComplaints: builder.query({
      query: () => "/complaints/my",
      providesTags: (result = []) => [
        "Complaints",
        ...result.map((c) => ({ type: "Complaints", id: c._id })),
      ],
    }),

    createComplaint: builder.mutation({
      query: (body) => ({
        url: "/complaints",
        method: "POST",
        body,
      }),
      // 🔥 FIXED: INVALIDATES BOTH citizen AND admin lists + REFETCHES
      invalidatesTags: ["Complaints", "AdminComplaints"],
    }),

    updateComplaintPhoto: builder.mutation({
      query: ({ id, photoUrl }) => ({
        url: `/complaints/${id}`,
        method: "PATCH",
        body: { photoUrl },
      }),
      invalidatesTags: ["Complaints", "AdminComplaints"], // 🔥 FIXED
    }),

    cancelComplaint: builder.mutation({
      query: (id) => ({
        url: `/complaints/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Complaints", "AdminComplaints"], // 🔥 FIXED
    }),

    getAdminComplaints: builder.query({
      query: (status = "all") =>
        status === "all"
          ? "/api/admin/complaints"
          : `/api/admin/complaints?status=${status}`,
      providesTags: (result = []) => [
        "AdminComplaints",
        ...result.map((c) => ({ type: "AdminComplaints", id: c._id })),
      ],
    }),

    markAdminRead: builder.mutation({
      query: (id) => ({
        url: `/api/admin/complaints/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminComplaints"],
    }),

    updateAdminComplaint: builder.mutation({
      query: ({ id, status, targetDate }) => ({
        url: `/api/admin/complaints/${id}`,
        method: "PATCH",
        body: { status, targetDate },
      }),
      invalidatesTags: ["AdminComplaints", "Complaints"],
    }),

    cancelComplaintByAdmin: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/api/admin/complaints/${id}/cancel`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["AdminComplaints", "Complaints"],
    }),

    markCitizenNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/complaints/${id}/read-notification`,
        method: "PATCH",
      }),
      invalidatesTags: ["Complaints"],
    }),
  }),
});

export const {
  useGetMyComplaintsQuery,
  useCreateComplaintMutation,
  useUpdateComplaintPhotoMutation,
  useCancelComplaintMutation,
  useGetAdminComplaintsQuery,
  useUpdateAdminComplaintMutation,
  useCancelComplaintByAdminMutation,
  useMarkAdminReadMutation,
  useMarkCitizenNotificationReadMutation
} = complaintsApiSlice;