import Link from 'next/link'

export default function TermsAndConditions() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-white">Terms and Conditions</h1>
      <div className="prose dark:prose-invert max-w-none space-y-6 text-zinc-600 dark:text-zinc-300">
        <p>
          Welcome to Nestara Estates. These terms and conditions outline the rules and regulations for the use of our website and services.
        </p>

        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing this website, we assume you accept these terms and conditions. Do not continue to use Nestara Estates if you do not agree to all of the terms and conditions stated on this page.
        </p>

        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mt-8 mb-4">2. User Accounts</h2>
        <p>
          When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the terms, which may result in immediate termination of your account on our service.
        </p>

        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mt-8 mb-4">3. Property Listings</h2>
        <p>
          Users may list properties for sale or rent. You represent and warrant that any information you provide in connection with such listings is accurate and that you have the right to list the property.
        </p>

        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mt-8 mb-4">4. Limitation of Liability</h2>
        <p>
          In no event shall Nestara Estates, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this website.
        </p>
      </div>
      <div className="mt-12">
        <Link href="/" className="text-amber-600 hover:text-amber-700 font-medium">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  )
}
