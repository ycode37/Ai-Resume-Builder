import axios from "axios";
import { VITE_APP_URL } from "@/config/config";

const axiosInstance = axios.create({
  baseURL: VITE_APP_URL + "api/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const checkATSScore = async (data, type) => {
  try {
    if (type === "file") {
      // Handle file upload
      const formData = new FormData();
      formData.append("resume", data);
      
      const response = await axios.post(
        VITE_APP_URL + "api/ats/check-file",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      return response.data.data;
    } else {
      // Handle existing resume
      const response = await axiosInstance.post("ats/check-existing", {
        resumeData: data,
      });
      return response.data.data;
    }
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Failed to analyze resume"
    );
  }
};

export { checkATSScore };
