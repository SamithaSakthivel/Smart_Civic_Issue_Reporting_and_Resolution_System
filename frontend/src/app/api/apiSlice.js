import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:3500",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  // ✅ FIX: Was [['user','Complaints','AdminComplaints']] — nested array breaks RTK Query.
  // Must be a flat array of strings.
  tagTypes: [
    'user',
    'Complaints',
    'AdminComplaints',
    'ContributorProfile',
    'ContributorIssues',
    'ContributorStats',
    'MyContributions',
  ],
  endpoints: builder => ({}),
});
