import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  username: string;
  // 필요한 다른 사용자 프로필 필드들을 여기에 추가할 수 있습니다
}

export const useUser = () => {
  const navigate = useNavigate();

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await axiosInstance.get("/auth/profile");
      return response.data;
    },
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && !profile) {
      navigate("/login");
    }
  }, [isLoading, profile, navigate]);

  return {
    profile,
    isLoading,
    error,
    isAuthenticated: !!profile,
  };
};
