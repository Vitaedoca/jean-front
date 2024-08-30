import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginForm() {
  return (

    <div className="mt-32">

        <Card className="mx-auto max-w-sm">
        <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
                Digite um login e senha válidos
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                required
                />
            </div>
            <div className="grid gap-2">
                <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                    Esqueceu sua senha?
                </Link>
                </div>
                <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
                Login
            </Button>
            </div>
            <div className="mt-4 text-center text-sm">
            Não tem uma conta?{" "}
            <Link href="/auth/register" className="underline">
                Sign up
            </Link>
            </div>
        </CardContent>
        </Card>
    </div>
  )
}
