import { BookOpen, ExternalLink, AlertCircle, Plane, MapPin, Compass, Radio, Gauge } from 'lucide-react';

export function ReferencesPage() {
  return (
    <div className="bg-slate-100 min-h-screen py-16 relative overflow-hidden">
      {/* Left Side Aviation Graphics */}
      <div className="hidden lg:block fixed left-0 top-1/2 -translate-y-1/2 text-emerald-200 opacity-20 pointer-events-none">
        <div className="space-y-12 p-8">
          <Plane className="w-24 h-24 transform -rotate-45" />
          <Compass className="w-20 h-20" />
          <Gauge className="w-20 h-20" />
          <MapPin className="w-16 h-16" />
          <Radio className="w-20 h-20" />
          <Plane className="w-24 h-24 transform rotate-12" />
        </div>
      </div>

      {/* Right Side Aviation Graphics */}
      <div className="hidden lg:block fixed right-0 top-1/2 -translate-y-1/2 text-emerald-200 opacity-20 pointer-events-none">
        <div className="space-y-12 p-8">
          <Radio className="w-20 h-20" />
          <Plane className="w-24 h-24 transform rotate-45" />
          <MapPin className="w-16 h-16" />
          <Gauge className="w-20 h-20" />
          <Compass className="w-20 h-20" />
          <Plane className="w-24 h-24 transform -rotate-12" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-emerald-600" />
          <h1 className="text-4xl font-bold mb-4">REFERENCES</h1>
          <p className="text-gray-600 text-lg">
            Resources and References to assist with your checkride preparation
          </p>
        </div>

        <div className="space-y-6">
          {/* FAA Resources */}
          <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-700">FAA Resources</h2>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.faa.gov/regulations_policies/handbooks_manuals/aviation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  FAA Handbooks & Manuals
                </a>
              </li>
              <li>
                <a
                  href="https://www.faa.gov/training_testing/testing/acs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Airman Certification Standards (ACS)
                </a>
              </li>
              <li>
                <a
                  href="https://www.faa.gov/regulations_policies/faa_regulations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Federal Aviation Regulations (FARs)
                </a>
              </li>
              <li>
                <a
                  href="https://iacra.faa.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  IACRA (Integrated Airman Certification and Rating Application)
                </a>
              </li>
            </ul>
          </section>

          {/* Required Documents */}
          <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Required Documents</h2>
            <p className="text-gray-700 mb-4">
              Review the following documents before your checkride:
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.faa.gov/training_testing/testing/acs/private_airplane_acs_6.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Private Pilot - Airplane ACS (FAA-S-ACS-6C)
                </a>
              </li>
              <li>
                <a
                  href="https://www.faa.gov/training_testing/testing/acs/instrument_rating_acs_change_1.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Instrument Rating - Airplane ACS (FAA-S-ACS-8B)
                </a>
              </li>
              <li>
                <a
                  href="https://www.faa.gov/training_testing/testing/acs/commercial_airplane_acs_7.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Commercial Pilot - Airplane ACS (FAA-S-ACS-7B)
                </a>
              </li>
              <li>
                <a
                  href="https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Pilot's Handbook of Aeronautical Knowledge (PHAK)
                </a>
              </li>
              <li>
                <a
                  href="https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/airplane_handbook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Airplane Flying Handbook (AFH)
                </a>
              </li>
              <li>
                <a
                  href="https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/instrument_flying_handbook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Instrument Flying Handbook (IFH)
                </a>
              </li>
              <li>
                <a
                  href="https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/instrument_procedures_handbook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Instrument Procedures Handbook (IPH)
                </a>
              </li>
              <li>
                <a
                  href="https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/14_afh_ch13.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Airplane Flying Handbook - Multiengine (Chapter 13 & 14)
                </a>
              </li>
              <li>
                <a
                  href="https://www.faa.gov/regulations_policies/advisory_circulars"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  FAA Advisory Circulars (ACs)
                </a>
              </li>
            </ul>
          </section>

          {/* Weather Resources */}
          <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Weather Resources</h2>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.aviationweather.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Aviation Weather Center
                </a>
              </li>
              <li>
                <a
                  href="https://www.weather.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  National Weather Service
                </a>
              </li>
              <li>
                <a
                  href="https://www.1800wxbrief.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  1800WXBrief (FlightService)
                </a>
              </li>
            </ul>
          </section>

          {/* Charts & Navigation */}
          <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Charts & Navigation</h2>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://skyvector.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  SkyVector - Flight Planning & Aeronautical Charts
                </a>
              </li>
              <li>
                <a
                  href="https://www.faa.gov/air_traffic/flight_info/aeronav"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  FAA Aeronautical Charts
                </a>
              </li>
              <li>
                <a
                  href="https://notams.aim.faa.gov/notamSearch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  NOTAM Search
                </a>
              </li>
            </ul>
          </section>

          {/* Additional Resources */}
          <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Additional Resources</h2>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.aopa.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Aircraft Owners and Pilots Association (AOPA)
                </a>
              </li>
              <li>
                <a
                  href="https://www.faa.gov/training_testing/testing/test_standards"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Practical Test Standards & ACS Documents
                </a>
              </li>
              <li>
                <a
                  href="https://designee.faa.gov/designeeLocator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  FAA Designee Locator
                </a>
              </li>
            </ul>
          </section>

          {/* Important Note */}
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Important Note</h3>
                <p className="text-yellow-800">
                  This list provides general references for pilot certification. Always ensure you're 
                  using the most current versions of all documents and publications. Check with your 
                  flight instructor for specific study materials and requirements for your checkride.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}