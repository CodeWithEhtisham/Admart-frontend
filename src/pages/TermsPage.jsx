import { Link } from 'react-router-dom'
import LegalLayout, { ContactEmail, Fill } from '../components/LegalLayout'
import { COMPANY_ADDRESS, COMPANY_NAME } from '../utils/site'

// Plans/credits/payments and agents sections mirror how the backend actually works. Have it
// reviewed before launch.
export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service">
      <section>
        <p>
          These terms apply when you use the Admart website and app, provided by {COMPANY_NAME} (&quot;Admart&quot;,
          &quot;we&quot;), a company registered in Pakistan, at {COMPANY_ADDRESS || <Fill>registered address</Fill>}. By
          creating an account or using Admart you agree to them. Please also read our{' '}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </section>

      <section>
        <h2>What Admart does</h2>
        <p>
          Admart helps you create social media content with AI (images, videos, scripts, voice-overs and captions), edit
          your own videos, and publish or schedule posts on the accounts you connect, such as YouTube, Facebook and
          Instagram. Agents can carry out several of these steps for you.
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
          <li>Generating content and running agents uses credits. The cost is shown before you start.</li>
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
          <li>If a generation or agent run fails, the credits reserved for it are returned automatically.</li>
        </ul>
      </section>

      <section id="refunds">
        <h2>Refunds</h2>
        <p>
          Plans and credit packs are not refundable once the payment is approved, whether or not the credits were used.
          If you paid twice by mistake, paid the wrong amount, or paid and never received your credits, email{' '}
          <ContactEmail /> within 7 days of the payment with the transaction ID. We will check it and, if confirmed,
          refund the extra amount to the account it came from or add the missing credits. This does not affect any rights
          you have under the law.
        </p>
      </section>

      <section id="agents">
        <h2>Agents, automation and scheduled posts</h2>
        <ul>
          <li>
            Agents create content for you, such as Shorts, edited videos and posts. You review the result before anything
            is published: an agent only posts to your accounts after you approve it.
          </li>
          <li>
            When you schedule a post, Admart publishes it at the time you chose using the accounts you connected. You can
            cancel a scheduled post before that time. If a platform rejects the post or is unavailable, we tell you and
            it is not retried without you.
          </li>
          <li>Autopilot starts agent runs on the schedule you set and uses credits for each run, within any limit you set.</li>
          <li>
            AI results can be wrong, incomplete or similar to content made for others. Check facts, names and claims
            before you publish.
          </li>
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
            and to the accounts you ask us to publish to.
          </li>
          <li>
            You must have the rights to anything you upload, including music, footage and the voices and faces of people
            shown, and you are responsible for what you publish.
          </li>
          <li>
            Follow each platform&apos;s rules for AI-generated or altered content, for example YouTube&apos;s disclosure of
            realistic altered or synthetic content.
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
          <li>is spam, misleading engagement bait, or breaks the rules of the platforms you publish to.</li>
        </ul>
        <p className="mt-3">
          Do not try to break, overload or get around Admart&apos;s security or credit system, or access other users&apos;
          data.
        </p>
      </section>

      <section id="platforms">
        <h2>Connected platforms and third-party services</h2>
        <p>When you connect an account, your use of that platform is also governed by its own terms:</p>
        <ul>
          <li>
            YouTube: Admart uses YouTube API Services, and by connecting YouTube you agree to the{' '}
            <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">YouTube Terms of Service</a>{' '}
            and the{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.
          </li>
          <li>
            Facebook and Instagram: the{' '}
            <a href="https://www.facebook.com/terms.php" target="_blank" rel="noopener noreferrer">Meta Terms of Service</a>{' '}
            and{' '}
            <a href="https://help.instagram.com/581066165581870" target="_blank" rel="noopener noreferrer">Instagram Terms of Use</a>.
          </li>
          <li>
            TikTok: the{' '}
            <a href="https://www.tiktok.com/legal/page/global/terms-of-service/en" target="_blank" rel="noopener noreferrer">
              TikTok Terms of Service
            </a>
            .
          </li>
        </ul>
        <p className="mt-3">
          These platforms can change or limit what Admart can do, and we are not responsible for their decisions, such as
          removing a post. You can disconnect any account at any time on the Social Accounts page.
        </p>
      </section>

      <section>
        <h2>Suspension and ending your account</h2>
        <p>
          You can stop using Admart at any time and delete your account in Settings. We may suspend or close accounts that
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
          are governed by the laws of Pakistan, and the courts of Pakistan have jurisdiction over any dispute.
        </p>
        <p className="mt-3">
          Contact: <ContactEmail />.
        </p>
      </section>
    </LegalLayout>
  )
}
