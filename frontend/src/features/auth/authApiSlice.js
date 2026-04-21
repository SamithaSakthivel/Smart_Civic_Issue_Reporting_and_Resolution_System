import { apiSlice } from "../../app/api/apiSlice";

export const authApiSlice=apiSlice.injectEndpoints({
    endpoints:builder=>({
        login:builder.mutation({
            query:credentials=>({
                url:"/auth/login",
                method:"POST",
                body:credentials
            })
        }),
        register:builder.mutation({
            query:data=>({
                url:'/auth/register',
                method:'POST',
                body:data
            })
        }),
        refresh:builder.query({
            query:()=>"/auth/refresh",
        }),
      logout: builder.mutation({
          query: () => ({
             url: '/auth/users/me',
             method: 'DELETE',
             credentials: 'include',
             headers:{
                'Authorization':`Bearer ${localStorage.getItem('accessToken') ||''}`
             }
    }),
    invalidatesTags: ['User'],
    }),
    })
})
export const {useLoginMutation,useRegisterMutation,useRefreshQuery,useLogoutMutation}=authApiSlice;