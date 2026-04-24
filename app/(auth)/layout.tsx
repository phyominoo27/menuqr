export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">MenuQR</h1>
          <p className="text-white/80 mt-2">QR Code Menus for Restaurants</p>
        </div>
        <div className="glass rounded-2xl p-8">{children}</div>
      </div>
    </div>
  )
}
