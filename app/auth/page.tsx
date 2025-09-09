"use client";

import { useState } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AuthPage() {
  const [tab, setTab] = useState('login')
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* @ts-ignore - Temporary fix for type pollution issue */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Log In</TabsTrigger>
            <TabsTrigger value="register">Create Account</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-6">
            <LoginForm onSuccess={() => setTab('login')} />
          </TabsContent>
          <TabsContent value="register" className="mt-6">
            <RegisterForm onSuccess={() => setTab('login')} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}