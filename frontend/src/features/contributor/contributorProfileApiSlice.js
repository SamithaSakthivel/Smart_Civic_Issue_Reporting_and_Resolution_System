// ✅ Copy of citizenProfileApiSlice → Just change endpoint to contributor
import { apiSlice } from "../../app/api/apiSlice";

export const contributorProfileApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfile: builder.query({
      query: () => "/contributor-profile/me",  // ✅ contributor endpoint
    }),
    updateMyProfile: builder.mutation({
      query: (body) => ({
        url: "/contributor-profile/me",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
} = contributorProfileApiSlice;