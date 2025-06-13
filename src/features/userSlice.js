import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    bankDetails: {
        bankName: '',
        bankAccountNumber: '',
        accountHolderName: '',
        bankAccountDetails: null,
    },
    bankDetailsError: null,
    bankDetailsLoading: false,
    bankDetailsSuccess: false,
}

export const userSlice = createSlice({

})

export const { } = userSlice.actions;
export default userSlice.reducer;