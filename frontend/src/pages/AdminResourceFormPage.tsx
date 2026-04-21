import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { resourceService } from '../services/resourceService';
import { ArrowLeft, Save } from 'lucide-react';

const resourceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum([
    'LECTURE_HALL',
    'LAB',
    'MEETING_ROOM',
    'EQUIPMENT',
    'PROJECTOR',
    'CAMERA',
    'OTHER',
  ] as const),
  description: z.string(),
  location: z.string().min(1, 'Location is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  status: z.enum(['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE'] as const),
  availabilityWindows: z.string(),
});

type ResourceFormData = z.infer<typeof resourceSchema>;

export function AdminResourceFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: '',
      type: 'LECTURE_HALL',
      description: '',
      location: '',
      capacity: 1,
      status: 'ACTIVE',
      availabilityWindows: '',
    },
  });

  useEffect(() => {
    if (isEditMode) {
      loadResource();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadResource = async () => {
    try {
      const data = await resourceService.getById(parseInt(id!));
      reset({
        name: data.name,
        type: data.type,
        description: data.description ?? '',
        location: data.location,
        capacity: data.capacity,
        status: data.status,
        availabilityWindows: data.availabilityWindows ?? '',
      });
    } catch (err) {
      console.error('Failed to load resource', err);
      setSubmitError('Failed to load resource data.');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit: SubmitHandler<ResourceFormData> = async (data) => {
    setSubmitError(null);
    try {
      if (isEditMode) {
        await resourceService.update(parseInt(id!), data);
      } else {
        await resourceService.create(data);
      }
      navigate('/admin/resources');
    } catch (err) {
      console.error('Failed to save resource', err);
      setSubmitError('Failed to save resource. Please try again.');
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <button
        onClick={() => navigate('/admin/resources')}
        className="group flex items-center text-gray-600 hover:text-indigo-600 font-medium transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Resources
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/70">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Resource' : 'Add New Resource'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEditMode
              ? 'Update the details of the existing resource below.'
              : 'Fill in the details to create a new resource.'}
          </p>
        </div>

        <div className="p-6">
          {submitError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="e.g. Main Auditorium"
                />
                {errors.name && <p className="mt-1 text-sm text-rose-500">{errors.name.message}</p>}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register('type')}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="LECTURE_HALL">Lecture Hall</option>
                  <option value="LAB">Laboratory</option>
                  <option value="MEETING_ROOM">Meeting Room</option>
                  <option value="EQUIPMENT">Equipment</option>
                  <option value="PROJECTOR">Projector</option>
                  <option value="CAMERA">Camera</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.type && <p className="mt-1 text-sm text-rose-500">{errors.type.message}</p>}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Additional details about this resource..."
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('location')}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="e.g. Building A, Room 101"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-rose-500">{errors.location.message}</p>
                )}
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  {...register('capacity', { valueAsNumber: true })}
                  min={1}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                {errors.capacity && (
                  <p className="mt-1 text-sm text-rose-500">{errors.capacity.message}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register('status')}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-rose-500">{errors.status.message}</p>
                )}
              </div>

              {/* Availability Windows */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability Windows
                </label>
                <input
                  type="text"
                  {...register('availabilityWindows')}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="e.g. Mon-Fri 08:00-17:00"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/resources')}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isEditMode ? 'Update Resource' : 'Save Resource'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
