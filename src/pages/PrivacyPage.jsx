import { Link } from 'react-router-dom'
import LegalLayout, { ContactEmail, Fill } from '../components/LegalLayout'
import { COMPANY_NAME } from '../utils/site'

// Describes what the app actually does with data (see admart-backend). Have it reviewed
// before launch and fill every <Fill> placeholder.
export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <section>
        <p>
          This policy explains what information {COMPANY_NAME} (&quot;Admart&quot;, &quot;we&quot;) collects when you
          use the Admart website and app, how we use it, and the choices you have. Admart is operated by{' '}
          <Fill>legal company name and registered address</Fill>.
        </p>
      </section>

      <section>
        <h2>Information we collect</h2>
        <ul>
          <li>
            <strong>Account details:</strong> your name and email address, and your password (stored only as a secure
            hash). If you sign in with Google, we receive your name, email address, profile picture and Google account ID.
          </li>
          <li>
            <strong>Your content:</strong> projects, brand details, the prompts you write, images and videos you upload,
            and the images and videos generated for you.
          </li>
          <li>
            <strong>Payments:</strong> for EasyPaisa payments, the plan or credit pack you chose, the amount, the
            transaction ID and the payment screenshot you upload. We do not receive or store card or bank login details.
          </li>
          <li>
            <strong>Connected social accounts:</strong> when you connect YouTube, Facebook, Instagram, TikTok or Snapchat,
            we receive access tokens from that platform plus your account ID, name, handle and profile picture. We store
            tokens encrypted. For posts you publish through Admart we store the result and basic statistics (such as
            views and likes) to show your analytics.
          </li>
          <li>
            <strong>Usage information:</strong> credit balance and usage, generation and publishing history, when you
            were last active, and technical logs (such as IP address and browser) that our servers record.
          </li>
        </ul>
      </section>

      <section>
        <h2>How we use your information</h2>
        <ul>
          <li>To provide Admart: generate media, keep your library, and publish to the accounts you connect.</li>
          <li>To manage your plan and credits, and to review and confirm payments.</li>
          <li>To keep the service secure, prevent abuse, and fix problems.</li>
          <li>To send account emails such as password reset links.</li>
        </ul>
        <p className="mt-3">We do not sell your personal information and we do not use it for advertising.</p>
      </section>

      <section>
        <h2>AI providers</h2>
        <p>
          To create images and videos, we send your prompt and any images you provide to our AI generation provider,
          fal.ai. When you use &quot;Enhance prompt&quot;, your prompt is sent to Google&apos;s Gemini API. These
          providers process the data to return results to us.
        </p>
      </section>

      <section>
        <h2>Social platforms, YouTube and Google data</h2>
        <p>
          Admart only posts to a connected account when you ask it to. You can disconnect an account at any time on the
          Social Accounts page, and you can also revoke Admart&apos;s access from the platform itself, for example in your{' '}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">Google account permissions</a>
          {' '}or your Facebook and TikTok app settings.
        </p>
        <p className="mt-3">
          Admart uses YouTube API Services. By connecting YouTube you also agree to the{' '}
          <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">YouTube Terms of Service</a>, and
          Google&apos;s handling of your data is described in the{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.
        </p>
        <p className="mt-3">
          Admart&apos;s use and transfer of information received from Google APIs to any other app will adhere to the{' '}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
      </section>

      <section>
        <h2>Who we share information with</h2>
        <ul>
          <li>Service providers that run Admart for us: hosting, email delivery, and the AI providers above.</li>
          <li>The social platforms you connect, when you publish to them.</li>
          <li>Authorities, when the law requires it.</li>
        </ul>
      </section>

      <section>
        <h2>Security and storage</h2>
        <p>
          Connections use HTTPS, social account tokens are encrypted at rest, and payment screenshots are stored privately
          and are only visible to you and our payments team. Data is stored on servers located in{' '}
          <Fill>country of your server</Fill>.
        </p>
      </section>

      <section>
        <h2>How long we keep information</h2>
        <p>
          We keep your information while your account is open. When you delete your account, we delete your account
          details, projects, generated media and connected-account tokens within <Fill>number</Fill> days, except payment
          records that we must keep for legal or accounting reasons.
        </p>
      </section>

      <section id="data-deletion">
        <h2>Your choices and data deletion</h2>
        <ul>
          <li>You can update your name on the Settings page and disconnect social accounts on the Social Accounts page.</li>
          <li>
            To get a copy of your data or to delete your account and its data, email <ContactEmail /> from the email
            address on your account. We will confirm when it is done.
          </li>
        </ul>
      </section>

      <section>
        <h2>Cookies and local storage</h2>
        <p>
          Admart keeps you signed in and remembers settings such as light or dark mode using your browser&apos;s local
          storage. We do not use advertising or third-party tracking cookies.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>Admart is not intended for children under 13, and we do not knowingly collect their information.</p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>
          If we make significant changes, we will update the date above and let you know in the app or by email. See also
          our <Link to="/terms">Terms of Service</Link>.
        </p>
      </section>
    </LegalLayout>
  )
}
