import { apiSlice } from '../../app/api/apiSlice'; // adjust path to your apiSlice

export const contributorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getMyProfile: builder.query({
      query: () => '/contributor/profile',
      providesTags: ['ContributorProfile'],
    }),

    updateMyProfile: builder.mutation({
      query: (data) => ({ url: '/contributor/profile', method: 'PUT', body: data }),
      invalidatesTags: ['ContributorProfile'],
    }),

    getContributorIssues: builder.query({
      query: () => '/contributor/issues',
      providesTags: ['ContributorIssues'],
    }),

    recordContribution: builder.mutation({
      query: (data) => ({ url: '/contributor/contribute', method: 'POST', body: data }),
      invalidatesTags: ['ContributorProfile', 'ContributorStats', 'ContributorIssues', 'MyContributions'],
    }),

    getMyContributions: builder.query({
      query: () => '/contributor/my-contributions',
      providesTags: ['MyContributions'],
    }),

    getMyStats: builder.query({
      query: () => '/contributor/stats',
      providesTags: ['ContributorStats'],
    }),

  }),
});

export const {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useGetContributorIssuesQuery,
  useRecordContributionMutation,
  useGetMyContributionsQuery,
  useGetMyStatsQuery,
} = contributorApiSlice;
