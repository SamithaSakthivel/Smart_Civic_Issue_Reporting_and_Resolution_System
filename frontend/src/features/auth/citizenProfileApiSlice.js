// features/citizen/citizenProfileApiSlice.js
import { apiSlice } from "../../app/api/apiSlice";

export const citizenProfileApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfile: builder.query({
      query: () => "/citizen-profile/me",
    }),
    updateMyProfile: builder.mutation({
      query: (body) => ({
        url: "/citizen-profile/me",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
} = citizenProfileApiSlice;