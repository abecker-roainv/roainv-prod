// /app/auth/config.js
import GoogleProvider from 'next-auth/providers/google'

const ALLOWED_DOMAINS = [
  'roainvestment.com',
  'renta-capital.cl',
  'kapture.cl',
  'gstax.cl',
];

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      console.log('=== SignIn Callback ===');
      const userDomain = profile.email.split('@')[1];
      
      console.log('Profile:', {
        email: profile.email,
        verified: profile.email_verified,
        domain: userDomain
      });
      
      const isAllowedDomain = ALLOWED_DOMAINS.includes(userDomain);
      const isAllowed = profile.email_verified && isAllowedDomain;
      
      console.log('Domain check:', {
        userDomain,
        isAllowedDomain,
        isAllowed
      });
      
      return isAllowed;
    },
    async session({ session, token }) {
      console.log('=== Session Callback ===');
      console.log('Session user:', session?.user);
      
      if (session?.user) {
        session.user.id = token.sub;
        // Podemos agregar el dominio como parte de la información de la sesión
        session.user.domain = session.user.email.split('@')[1];
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: true,
}