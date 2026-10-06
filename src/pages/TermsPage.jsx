import { Link } from 'react-router-dom'
import LegalLayout, { ContactEmail, Fill } from '../components/LegalLayout'
import { COMPANY_NAME } from '../utils/site'

// Plans/credits/payments sections mirror how the backend actually works. Have it
// reviewed before launch and fill every <Fill> placeholder.
export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service">
      <section>
        <p>
          These terms apply when you use the Admart website and app, provided by {COMPANY_NAME} (&quot;Admart&quot;,
          &quot;we&quot;). By creating an account or using Admart you agree to them. Please also read our{' '}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </section>

      <section>
        <h2>Your account</h2>
        <ul>
          <li>You must be at least 13 years old, and old enough to make payments where you live if you buy a plan.</li>
          <li>Keep your login details safe. You are responsible for activity on your account.</li>
          <li>Give accurate information, including when you submit payments.</li>
        </ul>
      </section>

      <section>
        <h2>Plans, credits and payments</h2>
        <ul>
          <li>Generating images and videos uses credits. The cost is shown before you generate.</li>
          <li>
            A paid plan gives you its monthly credits for 30 days from when your payment is approved. Renewing the same
            plan early adds 30 days after your current period ends. When a plan ends without renewal, your account moves
            to the Free plan and unused plan credits expire.
          </li>
          <li>Credits from top-up packs do not expire while your account is open.</li>
          <li>
            Payments are made by EasyPaisa and confirmed after our team reviews the payment screenshot and transaction ID.
            Credits are added once a payment is approved.
          </li>
          <li>
            Refunds: <Fill>your refund policy, e.g. when a payment can be refunded and how to ask</Fill>.
          </li>
          <li>If a generation fails, the credits reserved for it are returned automatically.</li>
        </ul>
      </section>

      <section>
        <h2>Your content</h2>
        <ul>
          <li>
            You keep the rights you have in the prompts, images and videos you provide, and, as far as the law allows, in
            the media Admart generates for you.
          </li>
          <li>
            You allow us to store, process and send your content as needed to run Admart, including to our AI providers
            and to the social accounts you ask us to publish to.
          </li>
          <li>
            AI-generated results can be similar to results created for others. You are responsible for checking that what
            you publish is lawful and follows each platform&apos;s rules.
          </li>
        </ul>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>Do not use Admart to create or publish content that:</p>
        <ul>
          <li>is illegal, or infringes someone else&apos;s copyright, trademark or privacy;</li>
          <li>sexualises minors, or is sexually explicit without the consent of the people shown;</li>
          <li>harasses, threatens or promotes violence or hatred against people or groups;</li>
          <li>impersonates real people or deceives viewers, such as fake endorsements or misleading deepfakes;</li>
          <li>is spam or breaks the rules of the platforms you publish to.</li>
        </ul>
        <p className="mt-3">
          Do not try to break, overload or get around Admart&apos;s security or credit system, or access other users&apos;
          data.
        </p>
      </section>

      <section>
        <h2>Connected platforms and third-party services</h2>
        <p>
          When you connect YouTube, Facebook, Instagram, TikTok or Snapchat, your use of those services is also governed by
          their own terms, including the{' '}
          <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">YouTube Terms of Service</a>.
          These platforms can change or limit what Admart can do, and we are not responsible for their decisions.
        </p>
      </section>

      <section>
        <h2>Suspension and ending your account</h2>
        <p>
          You can stop using Admart at any time and ask us to delete your account. We may suspend or close accounts that
          break these terms or put other users or the service at risk.
        </p>
      </section>

      <section>
        <h2>Disclaimers and liability</h2>
        <p>
          Admart is provided &quot;as is&quot;. We work to keep it available and accurate, but we cannot promise it will
          always be uninterrupted or error-free, or that AI results will meet your needs. To the extent the law allows, we
          are not liable for indirect or consequential losses, and our total liability is limited to the amount you paid
          us in the 12 months before the claim.
        </p>
      </section>

      <section>
        <h2>Changes and governing law</h2>
        <p>
          We may update these terms; if the changes are significant we will tell you in the app or by email. These terms
          are governed by the laws of <Fill>country / jurisdiction</Fill>.
        </p>
        <p className="mt-3">
          Contact: <ContactEmail />.
        </p>
      </section>
    </LegalLayout>
  )
}
