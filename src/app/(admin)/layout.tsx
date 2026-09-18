// app/(admin)/layout.tsx

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" style={{ fontSize: '100%' }}>
            {/* fontSize: 100% ensures it defaults to standard 16px, fixing Tailwind */}
            <body>
                {children}
            </body>
        </html>
    );
}