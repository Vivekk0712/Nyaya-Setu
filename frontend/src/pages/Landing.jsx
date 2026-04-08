import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Nyaya-Setu
          </h1>
          <p className="text-2xl text-gray-600 mb-4">
            Your Autonomous Digital Public Defender
          </p>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            Translate complex legal notices into simple language, draft formal FIRs mapped to BNS laws, 
            and get proactive follow-ups until justice is served.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-3 bg-justice-blue text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 border-2 border-justice-blue text-justice-blue rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-justice-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Describe Your Issue</h3>
            <p className="text-gray-600">
              Tell us what happened in your own words, in any language. Our AI understands your situation.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-justice-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">Get Legal Draft</h3>
            <p className="text-gray-600">
              Receive a professionally formatted FIR or complaint, mapped to exact BNS sections.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-justice-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Automatic Follow-ups</h3>
            <p className="text-gray-600">
              We track your case and send nudges to authorities if they don't respond in time.
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Multi-Language Support</h3>
              <p className="text-gray-600">
                Describe your issue in Hindi, English, or any regional language.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">BNS Law Mapping</h3>
              <p className="text-gray-600">
                Automatically identifies relevant sections from Bharatiya Nyaya Sanhita.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Instant PDF Generation</h3>
              <p className="text-gray-600">
                Download professionally formatted legal documents ready to file.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Case Tracking</h3>
              <p className="text-gray-600">
                Monitor your case status and see timeline of all actions taken.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-lg text-gray-600 mb-8">
          Join thousands of citizens accessing justice through technology
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="px-8 py-3 bg-justice-blue text-white rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
        >
          Create Free Account
        </button>
      </div>
    </div>
  )
}
