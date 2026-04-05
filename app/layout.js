import "./globals.css";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />  
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}