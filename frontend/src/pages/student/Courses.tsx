import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Users, Trophy } from 'lucide-react';
import { coursesApi } from '../../api/courses.api';
import Loading from '../../components/ui/Loading';

export default function Courses() {
  const { t } = useTranslation();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: coursesApi.list,
  });

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">📚 {t('nav.courses')}</h1>
        <p className="text-slate-500 mt-1">Оқуды бастау үшін курс таңдаңыз</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses?.map((course: any) => (
          <Link
            key={course.id}
            to={`/student/courses/${course.id}`}
            className="card hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900 truncate">
                  {course.title}
                </h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.topicsCount} topics
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    {course.levelsCount} levels
                  </span>
                  <span className="flex items-center gap-1">
                    📝 {course.tasksCount} tasks
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {courses?.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-slate-500">Әзірге курстар жоқ</p>
        </div>
      )}
    </div>
  );
}