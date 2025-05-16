'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, Lock } from "lucide-react"
import { useAuthStore } from "@/stores/useAuthStore"
import axios from "axios"
import { env } from "@/libs/env.helper"
import { useRouter } from "next/navigation"
import { useState } from "react"
import RegisterButton from "../ui/buton/RegisterButton"

export default function LoginpPage() {
  const {setTokens, setUser} = useAuthStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState("");


  //---------------------- BEGIN VALIDATION EMAIL, PASSWORD ----------------------//
  const validateEmail = (email: string) => {
    // Regex cơ bản để kiểm tra định dạng email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);

    if (!validateEmail(val)) {
      setEmailError("Email không hợp lệ");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);

    if (val.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
    } else {
      setPasswordError("");
    }
  };
  //---------------------- END VALIDATION EMAIL, PASSWORD ----------------------//

  const onFinish = async() => {
    try {
      //console.log('email, password ===>', email, password);
      const responseLogin = await axios.post(`${env.API_URL}/auth/login`, 
        {
          email,
          password
        }
      )
      if(responseLogin.status === 200) {
        setTokens(responseLogin?.data?.data);
        //console.log('Accesstoken ===>', responseLogin?.data?.data?.accessToken);
      }
      
      //lưu thông tin người đăng nhập vào storage
      const responseProfile = await axios.get(`${env.API_URL}/auth/my-profile`,
        {
          headers: {
            "Content-Type": 'application/json',
            "Authorization": `bearer ${responseLogin?.data?.data?.accessToken}`
          }
        }
      )
      if(responseProfile?.status === 200) {
        setUser(responseProfile?.data?.data)
        // chuyến hướng sang trang Dashboard
        router.push('/');
      }
    } catch (error) {
    // Nếu lỗi từ server, show alert
      console.error("Email hoặc mật khẩu không đúng", error);
      alert("Email hoặc mật khẩu không đúng");
    }
  }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-sm p-6 shadow-xl rounded-2xl">
        <CardContent className="space-y-6">
          <h1 className="text-2xl font-bold text-center">Đăng nhập</h1>
          <div className="space-y-4">
            <div className="flex flex-col">
              <div className="flex items-center border rounded px-3 py-2">
                <Mail className="w-4 h-4 text-gray-500 mr-2" />
                <Input 
                onChange={handleEmailChange}
                value={email}
                type="email" 
                placeholder="Email" 
                className="border-none p-0 focus-visible:ring-0" 
                />
              </div>
                {emailError && (
              <div className="text-red-500 text-sm mt-1">{emailError}</div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center border rounded px-3 py-2">
                <Lock className="w-4 h-4 text-gray-500 mr-2" />
                <Input 
                onChange={handlePasswordChange}
                value={password}
                type="password" 
                placeholder="Mật khẩu" 
                className="border-none p-0 focus-visible:ring-0" 
                />
              </div>
              {passwordError && (
              <div className="text-red-500 text-sm mt-1">
                {passwordError}
              </div>
              )}
            </div>
            <Button 
            onClick={onFinish}
            className="w-full">
              Đăng nhập
            </Button>
          </div>
          <RegisterButton />
        </CardContent>
      </Card>
    </div>
  )
}

