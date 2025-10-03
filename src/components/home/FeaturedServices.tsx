export default function FeaturedServices() {
  const services = [
    { name: 'Plumbing', icon: '🔧', color: 'bg-blue-100 text-blue-600' },
    { name: 'Electrical', icon: '⚡', color: 'bg-yellow-100 text-yellow-600' },
    { name: 'HVAC', icon: '❄️', color: 'bg-cyan-100 text-cyan-600' },
    { name: 'Cleaning', icon: '🧹', color: 'bg-green-100 text-green-600' },
    { name: 'Painting', icon: '🎨', color: 'bg-purple-100 text-purple-600' },
    { name: 'Landscaping', icon: '🌱', color: 'bg-emerald-100 text-emerald-600' },
  ];

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Popular Services
          </h2>
          <p className="text-lg text-gray-600">
            Discover the most requested services in your area
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {services.map((service) => (
            <div
              key={service.name}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="text-center">
                <div className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center mx-auto mb-3 text-2xl`}>
                  {service.icon}
                </div>
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

