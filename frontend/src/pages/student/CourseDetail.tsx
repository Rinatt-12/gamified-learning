import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock, Trophy } from 'lucide-react';
import { coursesApi } from '../../api/courses.api';
import Loading from '../../components/ui/Loading';

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.getById(courseId!),
    enabled: !!courseId,
  });

  if (isLoading) return <Loading />;
  if (!course) return <div>Курс табылмады</div>;

  return (
    <div className="space-y-6">
      <Link
        to="/student/courses"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Курстарға қайту
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">{course.title}</h1>
        <p className="text-slate-500 mt-2">{course.description}</p>
      </div>

      <div className="space-y-6">
        {course.topics?.map((topic: any) => (
          <div key={topic.id} className="card">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{topic.icon || '📖'}</span>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{topic.title}</h2>
                <p className="text-sm text-slate-500">{topic.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              {topic.levels?.map((level: any) => (
                <div
                  key={level.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-3">
                    {level.isLocked ? (
                      <Lock className="w-5 h-5 text-slate-400" />
                    ) : (
                      <Unlock className="w-5 h-5 text-green-500" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">{level.title}</p>
                      <p className="text-xs text-slate-500">
                        {level.tasks?.length || 0} тапсырма
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-sm font-bold text-yellow-600">
                      <Trophy className="w-4 h-4" />
                      {level.xpReward} XP
                    </span>
                    {!level.isLocked && level.tasks?.[0] && (
                      <Link
                        to={`/student/tasks/${level.tasks[0].id}`}
                        className="btn-primary text-sm px-3 py-1"
                      >
                        Бастау
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}