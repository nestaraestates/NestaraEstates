import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
          Get in Touch
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Have a question about a property, verification, or our services? Our team is here to help.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Contact Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-amber-50 dark:bg-amber-950/20 p-8 rounded-3xl border border-amber-100 dark:border-amber-900/50">
            <h3 className="text-xl font-bold text-amber-900 dark:text-amber-500 mb-6">Contact Information</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-full text-amber-600 shadow-sm">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Phone / WhatsApp</p>
                  <p className="text-zinc-900 dark:text-white font-medium">-</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-full text-amber-600 shadow-sm">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-zinc-900 dark:text-white font-medium">-</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-full text-amber-600 shadow-sm">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Head Office</p>
                  <p className="text-zinc-900 dark:text-white font-medium">
                    -
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-zinc-950 p-8 md:p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">Send us a Message</h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Full Name</label>
                  <Input placeholder="John Doe" className="bg-zinc-50 dark:bg-zinc-900" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Phone Number</label>
                  <Input placeholder="+91 90000 00000" className="bg-zinc-50 dark:bg-zinc-900" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Email Address</label>
                <Input type="email" placeholder="john@example.com" className="bg-zinc-50 dark:bg-zinc-900" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Subject</label>
                <Input placeholder="How can we help you?" className="bg-zinc-50 dark:bg-zinc-900" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Message</label>
                <textarea 
                  className="w-full min-h-[150px] rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  placeholder="Type your message here..."
                ></textarea>
              </div>

              <Button className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 h-12">
                <Send className="mr-2 h-4 w-4" /> Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
