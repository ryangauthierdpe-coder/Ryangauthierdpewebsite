import { ImageWithFallback } from './figma/ImageWithFallback';
import { Award, Plane, GraduationCap, Users, Clock, TrendingUp } from 'lucide-react';
import headshotImage from 'figma:asset/869c67142a44c408f4af5b566e66e752ffe63578.png';
import cockpitImage from 'figma:asset/10281e2ca80c3218bc10a843f71652a69564f84a.png';

export function AboutPage() {
  return (
    <div className="bg-slate-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={cockpitImage}
            alt="Aviation"
            className="w-full h-full object-cover transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-slate-900/70"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <Award className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-5xl font-bold mb-4">About Ryan Gauthier</h1>
          <p className="text-xl text-gray-200">
            Designated Pilot Examiner | ATP | CFI, CFII, MEI | Aviation Business Owner
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Bio Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-12">
          {/* Headshot Photo */}
          <div className="flex justify-center mb-8">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-emerald-600 shadow-lg">
              <ImageWithFallback
                src={headshotImage}
                alt="Ryan Gauthier"
                className="w-full h-full object-cover transition-opacity duration-700"
                style={{ objectPosition: 'center 40%', transform: 'scale(1.1)' }}
              />
            </div>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              Ryan Gauthier is an Airline Transport Pilot (ATP), Certified Flight Instructor (CFI, CFII, MEI), 
              Designated Pilot Examiner (DPE), and aviation business owner who has been flying out of 
              Groton–New London Airport (GON) for more than 23 years. Born and raised in the region, he was 
              introduced to aviation at age 11 through the local ACE Camp, an experience that established a 
              lifelong commitment to aviation in a family with no prior aviation background.
            </p>

            <p className="text-lg text-gray-700 mb-6">
              Ryan earned his Private Pilot Certificate while still in high school and subsequently attended 
              the Florida Institute of Technology, where he earned a BS in Aviation Management with Flight. 
              After graduating, he entered into a partnership that led to the purchase of his first flight school in 2008.
            </p>

            <p className="text-lg text-gray-700 mb-6">
              In 2012, Ryan expanded into charter operations with the acquisition of Action Air. He currently 
              oversees a flight school and Part 135 charter operation based in Connecticut and Rhode 
              Island. He continues to fly as a Part 135 charter pilot and serves as an active Designated Pilot Examiner and FAA Safety Team 
              Representative.
            </p>

            <p className="text-lg text-gray-700">
              Ryan has accumulated more than 20,000 hours of total flight time, including over 10,000 hours 
              of dual instruction given. His career reflects a sustained commitment to aviation safety, 
              professional training standards, and the development of the next generation of pilots.
            </p>
          </div>
        </div>

        {/* Credentials & Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <Clock className="w-12 h-12 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-emerald-600 mb-2">20,000+</div>
            <div className="text-gray-700">Total Flight Hours</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <GraduationCap className="w-12 h-12 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-emerald-600 mb-2">10,000+</div>
            <div className="text-gray-700">Hours Dual Instruction</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <TrendingUp className="w-12 h-12 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-emerald-600 mb-2">23+</div>
            <div className="text-gray-700">Years of Experience</div>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Award className="w-8 h-8 text-emerald-600 mr-3" />
            Certifications & Ratings
          </h2>
          
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex items-start">
              <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
              <div>
                <div className="font-semibold">Airline Transport Pilot (ATP)</div>
              </div>
            </div>

            <div className="flex items-start">
              <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
              <div>
                <div className="font-semibold">Certified Flight Instructor (CFI)</div>
              </div>
            </div>

            <div className="flex items-start">
              <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
              <div>
                <div className="font-semibold">Instrument Instructor (CFII)</div>
              </div>
            </div>

            <div className="flex items-start">
              <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
              <div>
                <div className="font-semibold">Multi-Engine Instructor (MEI)</div>
              </div>
            </div>

            <div className="flex items-start">
              <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
              <div>
                <div className="font-semibold">Designated Pilot Examiner (DPE)</div>
              </div>
            </div>

            <div className="flex items-start">
              <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
              <div>
                <div className="font-semibold">Part 135 Director of Operations, Check Airman, Captain</div>
              </div>
            </div>

            <div className="flex items-start">
              <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
              <div>
                <div className="font-semibold">FAA Safety Team Representative</div>
              </div>
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mt-6">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <GraduationCap className="w-8 h-8 text-emerald-600 mr-3" />
            Education
          </h2>
          
          <div className="space-y-4">
            <div>
              <div className="font-semibold text-lg text-gray-900">Florida Institute of Technology</div>
              <div className="text-gray-700">Bachelor of Science in Aviation Management with Flight</div>
            </div>
          </div>
        </div>

        {/* Home Base */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center mt-8">
          <h3 className="text-xl font-semibold mb-2">Based at Westerly State Airport (WST)</h3>
        </div>

      </section>
    </div>
  );
}