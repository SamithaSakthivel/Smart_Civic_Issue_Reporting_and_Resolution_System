import { createSlice } from "@reduxjs/toolkit";

const authSlice=createSlice({
    name:'auth',
    initialState:{accessToken:null,user:null},
    reducers:{
        setCredentials:(state,action)=>{
            const {accessToken,user}=action.payload
            state.accessToken=accessToken
            state.user=user;
        },
        logOut:state=>{
            state.accessToken=null;
            state.user=null;
        }
    }

})

export const {setCredentials,logOut}=authSlice.actions;
export default authSlice.reducer;