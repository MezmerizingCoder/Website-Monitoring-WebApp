import React from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Globe className="size-4" />
            </div>
            <span className="text-xl font-bold text-white">UptimeGuard</span>
          </Link>
          <Link to="/login" className="text-sm text-zinc-400 hover:text-white">
            Back to Login
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="mb-2 text-3xl font-bold text-white">Terms &amp; Conditions</h1>
        <p className="mb-8 text-sm text-zinc-500">Last updated: August 22, 2026</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <p className="mb-4 text-zinc-400 italic">
              UptimeGuard is a personal project provided "as is." By using this service, you agree to the following terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using UptimeGuard, you agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">2. Description of Service</h2>
            <p>
              UptimeGuard is a website monitoring tool that checks the uptime, response time, and SSL status of URLs you configure. It sends notifications based on your settings when issues are detected.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">3. Account Responsibilities</h2>
            <ul className="ml-6 list-disc space-y-2">
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must provide accurate information when creating your account.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>You must not share your account with others or use the service for others' benefit without authorization.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Monitor URLs you do not own or have authorization to monitor.</li>
              <li>Use the service for any illegal purpose.</li>
              <li>Attempt to interfere with, compromise, or disrupt the service.</li>
              <li>Abuse the monitoring frequency or exceed reasonable usage limits.</li>
              <li>Use automated tools to spam the service with monitor requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">5. Service Availability</h2>
            <p>
              As a personal project, UptimeGuard may experience downtime for maintenance, updates, or unforeseen issues. There is no guaranteed uptime SLA. I will try my best to keep the service running reliably.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">6. Limitation of Liability</h2>
            <p>
              UptimeGuard is provided on an "as is" and "as available" basis. I am not responsible for any damages, losses, or consequences resulting from:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Missed or delayed uptime notifications.</li>
              <li>Service interruptions or downtime.</li>
              <li>Data loss or inaccuracies in monitoring results.</li>
              <li>Any decisions made based on the monitoring data.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">7. Termination</h2>
            <p>
              I reserve the right to suspend or terminate your account at any time if you violate these terms or use the service in a way that is harmful to others or the platform. You may also delete your account at any time from the Settings page.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">8. Intellectual Property</h2>
            <p>
              The UptimeGuard name, logo, and interface are my intellectual property. You may not copy, modify, or distribute any part of the service without permission.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">9. Changes to Terms</h2>
            <p>
              I may revise these terms at any time. Continued use of the service after changes means you accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">10. Contact</h2>
            <p>
              For questions about these terms, please reach out through the UptimeGuard support channels.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
