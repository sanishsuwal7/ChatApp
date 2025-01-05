import {create} from "zustand"
import {axiosInstance} from "../lib/axios.js"
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
    authUser:null,
    isSigninigUp:false,
    isLoggingIn: false,
    isUpdatingProfile:false,
    isCheckingAuth: true,

    checkAuth: async() => {
        try{
            const response = await axiosInstance.get("/auth/check")

            set({authUser:response.data})
        } catch(error){
            console.log("Error in checking", error)
            set({authUser:null})
        } finally {
            set({isCheckingAuth:false})
        }
    },

    signup: async(data) => {
        set({isSigninigUp: true});
        try {
            const response = await axiosInstance.post("/auth/signup", data);
            set({authUser:response.data})
            toast.signup("Account created successfully");
        } catch(error){
            
            toast.error(error.response.data.message)
        } finally {
            set({isSigninigUp:false})
        }
    },

    login: async(data) => {
        set({isLoggingIn: true});
        try {
            const response = await axiosInstance.post("/auth/login", data);
            set({authUser:response.data})
            toast.signup("Loggedin successfully");
        } catch(error){
            toast.error(error.response.data.message)
        } finally {
            set({isLoggingIn:false})
        }
    },

    logout: async () => {
        try {
          await axiosInstance.post("/auth/logout");
          set({ authUser: null });
          toast.success("Logged out successfully");
        } catch (error) {
          toast.error(error.response.data.message);
        }
      },
    
}))