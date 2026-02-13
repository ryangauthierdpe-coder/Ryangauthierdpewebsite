import { ImageWithFallback } from './figma/ImageWithFallback';
import { Plane, CheckCircle, FileText, MapPin, Phone, Mail, ChevronDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { ContactModal } from './contact-modal';
import { useState } from 'react';
import heroImage from 'figma:asset/3162b93294b2a2cca948042b0f884a1e0f88b4ad.png';
import aboutImage from 'figma:asset/5287011f43e89a904f734f9806fea8537278eba8.png';
import logo from 'figma:asset/d0ddd2463241120a30a55bfb7d41b4a075838de5.png';

interface HomePageProps {
  onNavigateToSchedule?: () => void;
}

export function HomePage({ onNavigateToSchedule }: HomePageProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactSubject, setContactSubject] = useState('General Inquiry');
  const [isFeesOpen, setIsFeesOpen] = useState(false);

  const openContactModal = (subject: string) => {
    setContactSubject(subject);
    setIsContactModalOpen(true);
  };

  return (
    <div className="bg-slate-100">
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)}
        subject={contactSubject}
      />
      
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={heroImage}
            alt="Aircraft cockpit instruments"
            className="w-full h-full object-cover transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-slate-900/70"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4 -mt-12">
          <img src={logo} alt="DPE Logo" className="w-72 h-auto mx-auto mb-2" />
          <h1 className="text-5xl font-bold mb-4">DESIGNATED PILOT EXAMINER</h1>
          <p className="text-gray-300 mb-8">
            <span className="text-5xl font-bold block mb-1">Ryan Gauthier</span>
            <span className="text-lg">Boston FSDO: EA-61</span>
          </p>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              onNavigateToSchedule?.();
            }}
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-10 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Schedule Your Checkride
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-center">Professional FAA Certification Services</h2>
              <p className="text-gray-700 mb-4">
                As an FAA Designated Pilot Examiner, I provide fair, thorough, and consistent practical testing for pilots working toward their initial certification or advanced ratings.
              </p>
              <p className="text-gray-700 mb-4">
                Every test follows FAA regulations and the Airman Certification Standards (ACS), with a focus on safety, skill, and sound decision-making. My goal is to create a clear, professional, and supportive testing environment where you can confidently show your abilities.
              </p>
              <p className="text-gray-700 mb-4">
                With over 20 years of aviation experience and a dedication to excellence, I strive to make each evaluation structured yet approachable, helping you perform at your best.
              </p>
              <p className="text-gray-700">
                Whether you're earning your Private Pilot Certificate or seeking administrative certification services, I'm committed to guiding you through a smooth, transparent, and professional testing process from start to finish.
              </p>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-lg">
              <ImageWithFallback
                src={aboutImage}
                alt="Aircraft on runway"
                className="w-full h-full object-cover transition-opacity duration-700"
                style={{ objectPosition: '10% 45%' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">SERVICES OFFERED</h2>
        
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Checkrides */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-2">Practical Tests</h3>
                <div className="mb-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-bold text-gray-700">Private Pilot - Airplane Single Engine Land (ASEL)</span>
                    <span className="text-2xl font-bold text-emerald-600">$850</span>
                  </div>
                </div>
                
                {/* Breakdown of Fees Dropdown */}
                <div className="mt-6 mb-6 border-t border-gray-200 pt-4">
                  <button
                    onClick={() => setIsFeesOpen(!isFeesOpen)}
                    className="w-full flex items-center justify-between text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="font-semibold text-gray-800">Practical Test Fee Policy</span>
                    <ChevronDown
                      className={`w-5 h-5 text-emerald-600 transition-transform duration-200 ${
                        isFeesOpen ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  {isFeesOpen && (
                    <div className="mt-4 px-4 py-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-2">Retest Fee - 50%</h5>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-2">Test Cancellation Fee – $250</h5>
                          <p className="text-gray-700 text-sm mb-2">
                            A $250 cancellation fee will apply if a scheduled practical test must be cancelled due to any of the following:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-2">
                            <li>Missing or incomplete training documentation</li>
                            <li>Training requirements not satisfied</li>
                            <li>Pre-existing aircraft airworthiness discrepancies</li>
                            <li>Experience requirements not met</li>
                            <li>Eligibility requirements not met</li>
                          </ul>
                        </div>
                        
                        <div className="pt-3 border-t border-blue-200">
                          <p className="text-gray-700 text-sm mb-2">
                            <strong>Applicants are strongly encouraged</strong> to verify that all documentation, endorsements, experience, and aircraft requirements are complete prior to the scheduled test date.
                          </p>
                          <p className="text-gray-700 text-sm">
                            If you have any questions regarding eligibility or required documentation, please reach out in advance. Ryan is happy to review your qualifications beforehand to help prevent avoidable cancellations due to last-minute discrepancies.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      onNavigateToSchedule?.();
                    }}
                    className="inline-block bg-transparent border-2 border-emerald-600 hover:bg-emerald-600/10 text-emerald-600 px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    See Availability
                  </button>
                </div>
                <p className="text-gray-600 text-sm mt-6 text-center">
                  **Additional Authorizations coming soon.**
                </p>
              </div>
            </div>
          </div>

          {/* Administrative Functions */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <FileText className="w-10 h-10 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-4">Administrative Functions</h3>
                <p className="text-gray-600 mb-4">Click on a service below for more details:</p>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="foreign-pilot">
                    <AccordionTrigger className="text-emerald-700 hover:text-emerald-900 text-left text-lg">
                      Foreign Pilot
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 pt-2 pl-4">
                      <ul className="space-y-3 mb-3">
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Issuance of Private pilot certificates and ratings at the private pilot certification level on the basis of the applicant's foreign license qualification in accordance with § 61.75.</span>
                        </li>
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Issuance of a private pilot, commercial pilot, or ATP certificate on the basis of a Bilateral Aviation Safety Agreement (BASA) Implementation Procedures for Licensing (IPL) in accordance with § 61.71(c).</span>
                        </li>
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Conversion of a European Union Part-Flight Crew Licensing (EU Part-FCL) pilot license to an FAA pilot certificate using the FAA/European Union Aviation Safety Agency (EASA) Technical Implementation Procedures—Licensing (TIP-L). Certificates issued will be at the private pilot certification level.</span>
                        </li>
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Requires a VALID Foreign Verification Letter</span>
                        </li>
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Requires an In-Person Meeting</span>
                        </li>
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span><strong>Processing Fee: $250</strong></span>
                        </li>
                      </ul>
                      <p className="text-sm mt-4">
                        Contact Ryan to begin the process.
                      </p>
                      <button
                        onClick={() => openContactModal('Foreign Pilot Examiner Inquiry')}
                        className="inline-block mt-3 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm transition-colors"
                      >
                        Contact Ryan
                      </button>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="military-competency">
                    <AccordionTrigger className="text-emerald-700 hover:text-emerald-900 text-left text-lg">
                      Military Competency
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 pt-2 pl-4">
                      <ul className="space-y-3 mb-3">
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Issuance of Commercial Pilot Certificates and ratings to qualified military pilot applicants as authorized (e.g., § 61.73).</span>
                        </li>
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Issue or upgrade pilot certificates bearing type ratings based on the applicant's military pilot qualifications.</span>
                        </li>
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Issuance of a flight instructor certificate and appropriate ratings from current and former U.S. military instructor pilots or U.S. military pilot examiners who meet the eligibility requirements as set forth in § 61.73(g) and 61.199(a)3.</span>
                        </li>
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>May be processed utilizing Remote Technology if application is submitted through IACRA</span>
                        </li>
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span><strong>Processing Fee: $250</strong></span>
                        </li>
                      </ul>
                      <p className="text-sm mt-4">
                        Contact Ryan to begin the process.
                      </p>
                      <button
                        onClick={() => openContactModal('Military Competency Examiner Inquiry')}
                        className="inline-block mt-3 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm transition-colors"
                      >
                        Contact Ryan
                      </button>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="flight-instructor-renewal">
                    <AccordionTrigger className="text-emerald-700 hover:text-emerald-900 text-left text-lg">
                      Flight Instructor Renewal
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 pt-2 pl-4">
                      <ul className="space-y-3 mb-3">
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Renewal of a flight instructor certificate that is still current and for which the renewal process is merely administrative (i.e., a practical test is not required for renewal of the applicant's flight instructor certificate) in accordance with § 61.197(a)(2)(i), (ii), (iii) and (iv).</span>
                        </li>
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>May be processed utilizing Remote Technology if the application is submitted through IACRA.</span>
                        </li>
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span><strong>Processing Fee: $150</strong></span>
                        </li>
                      </ul>
                      <p className="text-sm mt-4">
                        Contact Ryan to begin the process.
                      </p>
                      <button
                        onClick={() => openContactModal('Flight Instructor Renewal Examiner Inquiry')}
                        className="inline-block mt-3 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm transition-colors"
                      >
                        Contact Ryan
                      </button>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="ground-instructor">
                    <AccordionTrigger className="text-emerald-700 hover:text-emerald-900 text-left text-lg">
                      Ground Instructor
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 pt-2 pl-4">
                      <ul className="space-y-3 mb-3">
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Issuance of a ground instructor certificate for the basic, advanced, or instrument ratings, as per § 61.213.</span>
                        </li>
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>May be processed utilizing Remote Technology if the application is submitted through IACRA.</span>
                        </li>
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span><strong>Processing Fee: $150</strong></span>
                        </li>
                      </ul>
                      <p className="text-sm mt-4">
                        Contact Ryan to begin the process.
                      </p>
                      <button
                        onClick={() => openContactModal('Ground Instructor Examiner Inquiry')}
                        className="inline-block mt-3 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm transition-colors"
                      >
                        Contact Ryan
                      </button>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="basic-administrative">
                    <AccordionTrigger className="text-emerald-700 hover:text-emerald-900 text-left text-lg">
                      Basic Administrative Functions
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 pt-2 pl-4">
                      <p className="mb-3">Includes the following services:</p>
                      <ul className="space-y-3 mb-3">
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>SIC Type Ratings</span>
                        </li>
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>SOE Limitation Removals</span>
                        </li>
                        <li className="flex items-start ml-6">
                          <Plane className="w-3 h-3 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>May be processed utilizing Remote Technology if the application is submitted through IACRA.</span>
                        </li>
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>ATP Limitation Removals</span>
                        </li>
                        <li className="flex items-start ml-6">
                          <Plane className="w-3 h-3 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>May be processed utilizing Remote Technology if the application is submitted through IACRA.</span>
                        </li>
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Remote Pilot Certificate (per § 107.61 and 107.63)</span>
                        </li>
                        <li className="flex items-start">
                          <Plane className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Night flight limitation removal (per § 61.110)</span>
                        </li>
                      </ul>
                      <p className="text-sm mt-4 mb-3"><strong>Processing Fee: $150</strong></p>
                      <p className="text-sm mt-4">
                        Contact Ryan to begin the process.
                      </p>
                      <button
                        onClick={() => openContactModal('Basic Administrative Functions Inquiry')}
                        className="inline-block mt-3 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm transition-colors"
                      >
                        Contact Ryan
                      </button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>

          {/* Looking for a different test */}
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 shadow-sm">
            <p className="text-gray-600 mb-2 text-center">
              Looking for a service not listed?
            </p>
            <p className="text-gray-600 mb-4 text-center">
              Please use the FAA's Designee Locator Tool to find another DPE that is able to assist.
            </p>
            <div className="text-center">
              <a
                href="https://designee.faa.gov/designeeLocator"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-transparent border-2 border-emerald-600 hover:bg-emerald-600/10 text-emerald-600 px-6 py-2 rounded-lg transition-colors"
              >
                FAA Designee Locator Tool
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">CONTACT INFORMATION</h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center space-y-2">
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=58+Airport+Road+Westerly+RI+02891"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer hover:scale-110 transition-transform"
                >
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </a>
                <div>
                  <h3 className="font-semibold mb-1">Office Address</h3>
                  <p className="text-gray-700">
                    58 Airport Road<br />
                    Westerly, RI 02891
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-2">
                <a 
                  href="tel:860-912-3283"
                  className="cursor-pointer hover:scale-110 transition-transform"
                >
                  <Phone className="w-6 h-6 text-emerald-600" />
                </a>
                <div>
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <p className="text-gray-700">860-912-3283</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-2">
                <a 
                  href="mailto:RyanGauthierDPE@gmail.com"
                  className="cursor-pointer hover:scale-110 transition-transform"
                >
                  <Mail className="w-6 h-6 text-emerald-600" />
                </a>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-gray-700">RyanGauthierDPE@gmail.com</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  onNavigateToSchedule?.();
                }}
                className="block w-full bg-transparent border-2 border-emerald-600 hover:bg-emerald-600/10 text-emerald-600 text-center px-6 py-3 rounded-lg transition-colors"
              >
                Schedule a Checkride
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}