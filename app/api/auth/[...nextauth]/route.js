import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/app/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,// // session expire après 30 jours
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user || !user.password) return null

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role ?? null,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  // callback jwt est appelé à chaque fois qu'un token JWT est créé ou mis à jour. Il permet d'ajouter 
  // des informations personnalisées au token, comme l'ID de l'utilisateur, son rôle, et si son profil est complet.
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
      }

      if (account?.provider === "google" && profile?.email) {
        let dbUser = await prisma.user.findUnique({ where: { email: profile.email } })

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: profile.email,
              name: profile.name ?? "Google User",
              role: null,
            },
          })
        }

        token.id = dbUser.id
      }
  // Cette partie s'exécute TOUJOURS (credentials + google),
  //  elle vérifie si le token contient un ID d'utilisateur, w baad tlawej fi la base de données pour récupérer les infos de l'utilisateur (email, nom, rôle) et les ajoute au token.
  // w base sur le rôle de l'utilisateur, elle vérifie si le profil est complet (pour les développeurs, ça vérifie s'ils ont un profil développeur, pour les entreprises, ça vérifie s'ils ont un profil entreprise) et ajoute cette info au token aussi.
  
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: Number(token.id) },
          include: {
            developer: true,
            company: true,
          },
        })

        if (dbUser) {
          token.email = dbUser.email
          token.name = dbUser.name
          token.role = dbUser.role ?? null

          if (dbUser.role === "DEVELOPER") {
            token.profileComplete = !!dbUser.developer // !! permet de convertir en boolean, true si le profil existe, false sinon
          } else if (dbUser.role === "COMPANY") {
            token.profileComplete = !!dbUser.company
          } else {
            token.profileComplete = false
          }
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.role = token.role ?? null
        session.user.profileComplete = token.profileComplete ?? false
      }
      return session
    },

    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        if (!profile?.email) return false
      }
      return true
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (url.startsWith(baseUrl)) return url
      return baseUrl
    },
  },
  pages: {
    signIn: "/auth/signin",
    newUser: "/role-selection",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }