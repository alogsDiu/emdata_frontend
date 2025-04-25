import Link from 'next/link';
import styles from './page.module.css';
import { getLocalizedContent } from '@/lib/i18n'; // Make sure path is correct
import {
  MdOutlineEmail,
  MdOutlinePhone,
  MdOutlineLocationOn,
  MdOutlineAccessTime
} from 'react-icons/md';
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaLinkedinIn
} from 'react-icons/fa6';

// Define structure for the expected footer content
interface FooterContent {
  contactHeading?: string;
  faqHeading?: string;
  emailLabel?: string;
  phoneLabel?: string;
  addressLabel?: string;
  supportHoursLabel?: string;
  socialMediaLabel?: string;
  faqItems?: any[];
  copyright?: string; // Optional copyright text
}

// Define props for the Footer component
interface FooterProps {
  locale: string; // Locale is now required
}

// Make the component async
const Footer = async ({ locale }: FooterProps) => {

  // Fetch localized content specifically for the footer
  // Using 'footer' as the namespace, adjust if your structure is different
  const content: FooterContent = await getLocalizedContent(locale, 'footer');

  // Keep potentially non-translatable info separate or fetch if needed
  const contactDetails = {
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@EmData.com', // Example using env var
    phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+7 (XXX) XXX-XXXX',
    address: process.env.NEXT_PUBLIC_ADDRESS || '[Office or Mailing Address]',
    supportHours: 'Monday–Friday, 9:00 AM – 6:00 PM (GMT+5)' // This might also be localized
  };

  const socialLinks = {
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || '#',
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '#',
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || '#',
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || '#'
  };

  // Use fallback values if content is not found
  const contactHeading = content.contactHeading || "Contact Information";
  const faqHeading = content.faqHeading || "FAQ";
  const emailLabel = content.emailLabel || "Email";
  const phoneLabel = content.phoneLabel || "Phone";
  const addressLabel = content.addressLabel || "Address";
  const supportHoursLabel = content.supportHoursLabel || "Support Hours";
  const socialMediaLabel = content.socialMediaLabel || "Social Media";
  const faqItems = content.faqItems || [ // Default FAQ items if none loaded
      'Is my personal data safe and anonymous?',
      'Who can contribute their medical analyses?',
      'What types of medical data can I submit?',
      'Can I delete my data after submission?',
      'What can the data be used for?',
      'Who can access the anonymized data?'
  ];
  const currentYear = new Date().getFullYear();
  const copyrightText = content.copyright
      ? content.copyright.replace('{year}', currentYear.toString())
      : `© ${currentYear} EmData. All rights reserved.`;


  return (
    <div className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Left Column: Contact Information */}
        <div className={styles.footerColumn}>
          <h3 className={styles.footerHeading}>{contactHeading}</h3>
          <div className={styles.contactList}>
            <p className={styles.contactItem}>
              <MdOutlineEmail className={styles.icon} />
              {emailLabel}: <a href={`mailto:${contactDetails.email}`} className={styles.contactLink}>{contactDetails.email}</a>
            </p>
            <p className={styles.contactItem}>
              <MdOutlinePhone className={styles.icon} />
              {phoneLabel}: {contactDetails.phone}
            </p>
            <p className={styles.contactItem}>
              <MdOutlineLocationOn className={styles.icon} />
              {addressLabel}: {contactDetails.address}
            </p>
            <p className={styles.contactItem}>
              <MdOutlineAccessTime className={styles.icon} />
              {supportHoursLabel}: {contactDetails.supportHours}
            </p>
            <div className={styles.contactItem}>
               {/* Using a generic icon, replace if needed */}
              <span className={styles.icon}>🌐</span> 
              {socialMediaLabel}:
              <div className={styles.socialIcons}>
                {/* Social links remain the same */}
                 <Link href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className={styles.socialLink}><FaFacebookF /></Link>
                 <Link href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialLink}><FaInstagram /></Link>
                 <Link href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className={styles.socialLink}><FaXTwitter /></Link>
                 <Link href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialLink}><FaLinkedinIn /></Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: FAQ */}
        <div className={styles.footerColumn}>
          <h3 className={styles.footerHeading}>{faqHeading}</h3>
          <ul className={styles.faqList}>
            {faqItems.map((item, index) => (
              <li key={index} className={styles.faqItem}>
                <Link href={item[1]} className={styles.faqSubLink}>
                  {item[0]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

       {/* Footer Bottom Bar */}
       <div className={styles.footerBottomBar}>
         <p>{copyrightText}</p>
       </div>
    </div>
  );
};

export default Footer;