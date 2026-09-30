import { Navbar } from '@/components/navbar'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 RentRig. Premium hardware rental for professionals.</p>
      </footer>
    </div>
  )
}
