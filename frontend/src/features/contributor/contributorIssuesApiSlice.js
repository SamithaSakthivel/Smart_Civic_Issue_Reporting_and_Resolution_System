// features/contributor/contributorIssuesApiSlice.js
import { apiSlice } from "../../app/api/apiSlice";
export const contributorIssuesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getContributorIssues: builder.query({
      query: () => "/complaints/contributor-issues", // Backend: only contributors-visible
    }),
  }),
});

export const { useGetContributorIssuesQuery } = contributorIssuesApiSlice;