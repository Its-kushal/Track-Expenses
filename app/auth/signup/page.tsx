'use client'

import { useState } from 'react'
import { supabase } from "@/lib/supabase/client";

export default function SignupPage() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    console.log(data)

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    alert('Signup successful')

    setLoading(false)
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Signup</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleSignup} disabled={loading}>
        {loading ? 'Loading...' : 'Signup'}
      </button>
    </main>
  )
}