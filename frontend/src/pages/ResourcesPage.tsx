import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceService } from '../services/resourceService';
import type { Resource, ResourceType, ResourceStatus } from '../api/types';
import { Search, Filter, MapPin, Users, Activity, Layers, ArrowRight } from 'lucide-react';

export function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filters state
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [capacityMin, setCapacityMin] = useState<string>('');
  const [capacityMax, setCapacityMax] = useState<string>('');
  const [location, setLocation] = useState<string>('');

  const loadResources = useCallback(async (searchQuery = search) => {
    setLoading(true);
    try {
      const data = await resourceService.list({
        search: searchQuery || undefined,
        type: type || undefined,
        status: status || undefined,
        capacityMin: capacityMin ? parseInt(capacityMin) : undefined,
        capacityMax: capacityMax ? parseInt(capacityMax) : undefined,
        location: location || undefined,
      });
      setResources(data);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  }, [search, type, status, capacityMin, capacityMax, location]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadResources();
  };

  const getStatusColor = (status: ResourceStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'OUT_OF_SERVICE':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'MAINTENANCE':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'LECTURE_HALL':
        return <Layers className="w-4 h-4" />;
      case 'LAB':
        return <Activity className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Facilities & Assets
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Browse and discover resources available across the campus.
          </p>
        </div>
      </div>

      {/* Filters & Search Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or description..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            title="Filter by resource type"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LAB">Laboratory</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="EQUIPMENT">Equipment</option>
            <option value="PROJECTOR">Projector</option>
            <option value="CAMERA">Camera</option>
            <option value="OTHER">Other</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            title="Filter by resource status"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          <input
            type="number"
            placeholder="Min Capacity"
            value={capacityMin}
            onChange={(e) => setCapacityMin(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="number"
            placeholder="Max Capacity"
            value={capacityMax}
            onChange={(e) => setCapacityMax(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="text"
            placeholder="Location (e.g. Building A)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Grid View */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Filter className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No resources found</h3>
          <p className="mt-1 text-gray-500">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div
              key={resource.id}
              onClick={() => navigate(`/resources/${resource.id}`)}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="flex justify-between items-start mb-4">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(resource.status)}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                  {resource.status.replace('_', ' ')}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                  {getTypeIcon(resource.type)}
                  {resource.type.replace('_', ' ')}
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                {resource.name}
              </h3>

              <p className="text-gray-500 text-sm flex-grow line-clamp-2 mb-6">
                {resource.description || 'No description provided.'}
              </p>

              <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">{resource.capacity} seats</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium line-clamp-1">{resource.location}</span>
                </div>
              </div>

              <div className="absolute bottom-6 right-6 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                <div className="bg-indigo-50 p-2 rounded-full text-indigo-600">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
