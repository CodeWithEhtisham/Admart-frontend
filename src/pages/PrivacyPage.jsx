import { Link } from 'react-router-dom'
import LegalLayout, { ContactEmail, Fill } from '../components/LegalLayout'
import { COMPANY_ADDRESS, COMPANY_NAME } from '../utils/site'

// Describes what the app actually does with data (see admart-backend): keep it in step with the
// code, especially the platform permissions and AI providers, which platform reviewers check.
export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <section>
        <p>
          This policy explains what information {COMPANY_NAME} (&quot;Admart&quot;, &quot;we&quot;) collects when you
          use the Admart website and app, how we use it, who we share it with, and the choices you have. Admart is
          operated by {COMPANY_NAME}, a company registered in Pakistan, at {COMPANY_ADDRESS || <Fill>registered address</Fill>}.
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
            <strong>Your content:</strong> projects and brand details (such as brand name, colours and logo), the prompts
            and text you write, images and videos you upload, and everything generated for you: images, videos, scripts,
            voice recordings, captions, titles and post texts.
          </li>
          <li>
            <strong>Agents:</strong> when you run an agent we store its inputs, each step&apos;s results (for example a
            transcript of your video, planned cuts or written posts), your choices at each check-in, and the schedule you
            set.
          </li>
          <li>
            <strong>Payments:</strong> for EasyPaisa payments, the plan or credit pack you chose, the amount, the
            transaction ID and the payment screenshot you upload. We do not receive or store card or bank login details.
          </li>
          <li>
            <strong>Connected accounts:</strong> when you connect a social or ads account we receive access tokens from
            that platform plus your account ID, name, handle and profile picture (details below). Tokens are stored
            encrypted.
          </li>
          <li>
            <strong>Usage information:</strong> credit balance and usage, generation, agent and publishing history, when
            you were last active, and technical logs (such as IP address and browser) that our servers record.
          </li>
        </ul>
      </section>

      <section id="platform-data">
        <h2>Connected platforms: what we access and why</h2>
        <p>We only ask for what each feature needs, and we only act when you ask us to.</p>
        <ul>
          <li>
            <strong>YouTube (Google):</strong> permissions to manage your YouTube account and upload videos. We use them
            to show which channel is connected, upload the videos you approve with the title, description, tags, privacy
            and thumbnail you set, add them to a playlist you pick, and show view, like and comment counts for videos
            published through Admart.
          </li>
          <li>
            <strong>Facebook and Instagram (Meta):</strong> permissions to list your Facebook Pages and linked Instagram
            business accounts, publish the posts you approve, and read engagement (such as views and likes) for posts
            published through Admart.
          </li>
          <li>
            <strong>TikTok:</strong> your basic profile, and permission to upload and publish the videos you approve.
          </li>
          <li>
            <strong>Snapchat:</strong> your basic profile only.
          </li>
          <li>
            <strong>Ads accounts (Meta Ads, Google Ads):</strong> only if you connect them, to create and read the ads you
            set up in Admart.
          </li>
        </ul>
        <p className="mt-3">
          View, like and comment counts are fetched from the platform when you open Analytics or the Calendar, and are not
          stored by us. We keep the ID and link of each post you publish so you can find it again.
        </p>
      </section>

      <section>
        <h2>How we use your information</h2>
        <ul>
          <li>To provide Admart: generate media, keep your library, run the agents you start, and publish to the accounts you connect.</li>
          <li>To post at the time you choose when you schedule a post. Nothing is posted without your approval.</li>
          <li>To manage your plan and credits, and to review and confirm payments.</li>
          <li>To keep the service secure, prevent abuse, and fix problems.</li>
          <li>To send account emails such as password reset links.</li>
        </ul>
        <p className="mt-3">We do not sell your personal information and we do not use it for advertising.</p>
      </section>

      <section id="ai-providers">
        <h2>AI and other service providers</h2>
        <p>To create and edit content we send the data needed for each task to these providers:</p>
        <ul>
          <li>
            <strong>fal.ai:</strong> image and video generation, voice recordings, transcription of your videos (speech to
            text) and audio cleanup. We send your prompts, the images or videos you provide, and the text to be spoken.
          </li>
          <li>
            <strong>OpenRouter:</strong> routes text tasks (research, ideas, scripts, titles, captions and posts) to AI
            language models from providers such as Google and NVIDIA, and can search the web for research. We send the
            topic, your brand details and, for your own videos, the transcript.
          </li>
          <li>
            <strong>Google Gemini API:</strong> the &quot;Enhance prompt&quot; feature. We send the prompt you wrote.
          </li>
          <li>
            <strong>Pexels:</strong> stock video search. We send only search words, never your personal information.
          </li>
          <li>
            <strong>Hosting and email:</strong> our servers in Europe and our email delivery provider.
          </li>
        </ul>
        <p className="mt-3">
          These providers process the data to return results to us, under their own terms and privacy policies. Some AI
          models may be operated by providers that keep prompts, so please don&apos;t put sensitive personal information in
          prompts or videos you process with Admart.
        </p>
      </section>

      <section id="google-data">
        <h2>YouTube and Google user data</h2>
        <p>
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
          , including the Limited Use requirements. We do not use data received from Google APIs to train AI models, we do
          not sell it, and we do not use it for advertising. We send YouTube data to other services only to do what you
          asked (for example uploading your video to YouTube).
        </p>
        <p className="mt-3">
          You can disconnect YouTube at any time on the Social Accounts page, which deletes the access tokens we hold. You
          can also revoke Admart&apos;s access in your{' '}
          <a href="https://security.google.com/settings/security/permissions" target="_blank" rel="noopener noreferrer">
            Google security settings
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Who we share information with</h2>
        <ul>
          <li>The service providers listed above, only for the tasks described.</li>
          <li>The platforms you connect, when you publish or advertise there.</li>
          <li>Authorities, when the law requires it.</li>
        </ul>
      </section>

      <section>
        <h2>Security and storage</h2>
        <p>
          Connections use HTTPS, connected-account tokens are encrypted at rest, and payment screenshots are stored
          privately and are only visible to you and our payments team. Our servers are located in Europe.
        </p>
      </section>

      <section>
        <h2>How long we keep information</h2>
        <ul>
          <li>We keep your information while your account is open.</li>
          <li>When you disconnect a platform, we delete its access tokens immediately.</li>
          <li>
            When you delete your account, your account details, projects, generated media, uploads, agent runs and
            connected-account tokens are deleted immediately, and copies in our backups are removed within 14 days.
          </li>
          <li>
            We keep payment records (amount, plan, transaction ID, date and the payer&apos;s email) for legal and
            accounting reasons; payment screenshots are deleted.
          </li>
        </ul>
      </section>

      <section id="data-deletion">
        <h2>Your choices and data deletion</h2>
        <ul>
          <li>You can update your name on the Settings page and disconnect any connected account on the Social Accounts page.</li>
          <li>
            <strong>Delete your account yourself:</strong> sign in and go to Settings → Danger Zone. Deletion is
            immediate and permanent, and covers all data listed above (except payment records).
          </li>
          <li>
            If you can&apos;t sign in, want a copy of your data, or want us to delete data that came from Facebook,
            Instagram, YouTube or TikTok, email <ContactEmail /> from the email address on your account. We will confirm
            when it is done, within 30 days.
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
