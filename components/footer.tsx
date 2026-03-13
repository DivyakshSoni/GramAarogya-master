import Link from "next/link"
import { Github, Twitter, Linkedin } from "lucide-react"
import { useLang } from "@/components/lang-context"

export default function Footer() {
  const { t } = useLang()
  return (
    <footer className="border-t">
      <div className="container flex flex-col gap-8 py-8 md:flex-row md:py-12">
        <div className="flex-1 space-y-4">
          <h2 className="font-bold">GramCare</h2>
          <p className="text-sm text-muted-foreground">{t.footerTagline}</p>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-12 sm:grid-cols-3">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t.footerSolutions}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/health-check" className="text-muted-foreground transition-colors hover:text-primary">
                  AarogyaMitra AI
                </Link>
              </li>
              <li>
                <Link href="/find-doctor" className="text-muted-foreground transition-colors hover:text-primary">
                  AarogyaConnect
                </Link>
              </li>
              <li>
                <Link href="/g-map" className="text-muted-foreground transition-colors hover:text-primary">
                  AarogyaMap
                </Link>
              </li>
              <li>
                <Link href="/news-help" className="text-muted-foreground transition-colors hover:text-primary">
                  AarogyaPulse
                </Link>
              </li>
              <li>
                <Link href="/health-insights" className="text-muted-foreground transition-colors hover:text-primary">
                  AarogyaView
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t.footerCompany}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/our-team" className="text-muted-foreground transition-colors hover:text-primary">
                  AarogyaParivar
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t.footerConnect}</h3>
            <div className="flex space-x-4">
              <Link
                href="https://github.com/DivyakshSoni"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="https://www.linkedin.com/in/divyaksh-soni/"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="container border-t py-6">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} GramCare
        </p>
      </div>
    </footer>
  )
}

