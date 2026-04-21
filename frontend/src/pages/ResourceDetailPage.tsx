import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resourceService } from '../services/resourceService';
import type { Resource } from '../api/types';
import { MapPin, Users, ArrowLeft, Clock, Info, Activity, Layers } from 'lucide-react';

export function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadResource(parseInt(id));
    }
  }, [id]);

  const loadResource = async (resourceId: number) => {
    try {
      const data = await resourceService.getById(resourceId);
      setResource(data);
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1 rounded-full text-sm font-semibold border flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-current"></div>Active
          </span>
        );
      case 'OUT_OF_SERVICE':
        return (
          <span className="bg-rose-100 text-rose-700 border-rose-200 px-3 py-1 rounded-full text-sm font-semibold border flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-current"></div>Out of Service
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="bg-amber-100 text-amber-700 border-amber-200 px-3 py-1 rounded-full text-sm font-semibold border flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-current"></div>Maintenance
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resource not found</h2>
        <button
          onClick={() => navigate('/resources')}
          className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ← Back to Resources
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={() => navigate('/resources')}
        className="group flex items-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Directory
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center border border-gray-100 dark:border-gray-700">
              {resource.type === 'LAB' ? (
                <Activity className="w-10 h-10 text-indigo-600" />
              ) : (
                <Layers className="w-10 h-10 text-indigo-600" />
              )}
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {resource.name}
              </h1>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {getStatusBadge(resource.status)}
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm font-medium">
                  {resource.type.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                  <Info className="w-5 h-5 text-indigo-500" />
                  About
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  {resource.description || 'No description available for this resource.'}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  Availability Windows
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {resource.availabilityWindows || 'Standard Hours (Mon-Fri 08:00 - 18:00)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Quick Details
              </h3>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors hover:border-indigo-200">
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 mr-4">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Capacity</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {resource.capacity} People
                  </p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors hover:border-indigo-200">
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 mr-4">
                  <MapPin className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Location</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {resource.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
