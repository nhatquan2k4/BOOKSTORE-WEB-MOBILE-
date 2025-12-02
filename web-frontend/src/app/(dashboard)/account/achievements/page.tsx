'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
} from '@/components/ui';

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string; // giữ để map ra svg
  progress: number;
  total: number;
  unlocked: boolean;
  unlockedDate?: string;
  category: 'reading' | 'shopping' | 'social';
  reward?: string; // dạng "100 điểm"
}

const mockAchievements: Achievement[] = [
  {
    id: 1,
    title: 'Người đọc mới',
    description: 'Mua cuốn sách đầu tiên',
    icon: 'book-1',
    progress: 1,
    total: 1,
    unlocked: true,
    unlockedDate: '2024-10-15',
    category: 'shopping',
    reward: '50 điểm',
  },
  {
    id: 2,
    title: 'Mọt sách',
    description: 'Mua 10 cuốn sách',
    icon: 'books',
    progress: 7,
    total: 10,
    unlocked: false,
    category: 'shopping',
    reward: '200 điểm',
  },
  {
    id: 3,
    title: 'Tín đồ đọc sách',
    description: 'Đọc 5 cuốn sách',
    icon: 'read',
    progress: 5,
    total: 5,
    unlocked: true,
    unlockedDate: '2024-11-01',
    category: 'reading',
    reward: '100 điểm',
  },
  {
    id: 4,
    title: 'Nhà phê bình',
    description: 'Viết 10 đánh giá',
    icon: 'pen',
    progress: 3,
    total: 10,
    unlocked: false,
    category: 'social',
    reward: '150 điểm',
  },
  {
    id: 5,
    title: 'Khách hàng thân thiết',
    description: 'Chi tiêu trên 5 triệu',
    icon: 'diamond',
    progress: 2_800_000,
    total: 5_000_000,
    unlocked: false,
    category: 'shopping',
    reward: '500 điểm',
  },
  {
    id: 6,
    title: 'Người chia sẻ',
    description: 'Chia sẻ 5 sách với bạn bè',
    icon: 'share',
    progress: 5,
    total: 5,
    unlocked: true,
    unlockedDate: '2024-10-28',
    category: 'social',
    reward: '75 điểm',
  },
];

// cấu hình category để render badge
const categoryConfig = {
  reading: { label: 'Đọc sách', color: 'bg-blue-100 text-blue-700' },
  shopping: { label: 'Mua sắm', color: 'bg-purple-100 text-purple-700' },
  social: { label: 'Xã hội', color: 'bg-green-100 text-green-700' },
};

// cấu hình mốc hạng — muốn đổi chỉ sửa chỗ này
const RANK_TIERS = [
  { name: 'Đồng', min: 0 },
  { name: 'Bạc', min: 200 },
  { name: 'Vàng', min: 500 },
  { name: 'Bạch kim', min: 1000 },
  { name: 'Kim cương', min: 2000 },
];

// ====== CÁC HÀM TÍNH LOGIC (dùng lại được khi gọi API) ======

// đếm số achievement đã mở
function calculateUnlockedCount(achievements: Achievement[]) {
  return achievements.filter((a) => a.unlocked).length;
}

// tính tổng điểm từ các achievement đã mở
function calculateTotalPoints(achievements: Achievement[]) {
  return achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => {
      // reward dạng "100 điểm" -> tách số
      const point = parseInt(a.reward?.split(' ')[0] || '0', 10);
      return sum + point;
    }, 0);
}

// tính phần trăm tiến trình của từng achievement (có giới hạn 100)
function calculateAchievementPercent(achievement: Achievement) {
  if (achievement.total === 0) return 0;
  return Math.min((achievement.progress / achievement.total) * 100, 100);
}

// tính hạng hiện tại dựa trên tổng điểm
function calculateRank(totalPoints: number) {
  let current = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (totalPoints >= tier.min) {
      current = tier;
    } else {
      break;
    }
  }
  return current;
}

// lấy info hạng tiếp theo để hiển thị "cần X điểm để lên ..."
function getNextRankInfo(totalPoints: number) {
  const next = RANK_TIERS.find((tier) => tier.min > totalPoints);
  if (!next) {
    return {
      nextRank: null,
      pointsToNext: 0,
    };
  }
  return {
    nextRank: next.name,
    pointsToNext: next.min - totalPoints,
  };
}

// format số tiến trình (vì có achievement dùng số tiền)
function formatProgressNumber(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}tr`;
  }
  return value.toLocaleString('vi-VN');
}

// component icon cho achievement
function AchievementIcon({
  type,
  unlocked,
}: {
  type: string;
  unlocked: boolean;
}) {
  const wrapperClass = unlocked
    ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
    : 'bg-gray-200';

  return (
    <div
      className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${wrapperClass}`}
    >
      {type === 'book-1' && (
        <svg
          className="w-8 h-8 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 7H20" />
          <path d="M6.5 7A2.5 2.5 0 0 0 4 9.5v10" />
          <path d="M6.5 17A2.5 2.5 0 0 0 4 19.5" />
          <path d="M20 7v10" />
        </svg>
      )}
      {type === 'books' && (
        <svg
          className="w-8 h-8 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5V5.5A2.5 2.5 0 0 1 6.5 3H9" />
          <path d="M9 21V3" />
          <path d="M9 3h2.5A2.5 2.5 0 0 1 14 5.5v14" />
          <path d="M14 5.5h2.5A2.5 2.5 0 0 1 19 8v13" />
          <path d="M4 21h15" />
        </svg>
      )}
      {type === 'read' && (
        <svg
          className="w-8 h-8 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 5h6l1 7H4l-1-7Z" />
          <path d="m9 5 1 7" />
          <path d="M5 12h3" />
          <path d="m15 5 1.5 9.5 2-5 2.5-.5" />
        </svg>
      )}
      {type === 'pen' && (
        <svg
          className="w-7 h-7 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m18 2 4 4-11 11-4 1 1-4Z" />
          <path d="m15 5 4 4" />
        </svg>
      )}
      {type === 'diamond' && (
        <svg
          className="w-8 h-8 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3 2 9l10 12 10-12Z" />
          <path d="m12 3 3 6-3 12-3-12Z" />
          <path d="M2 9h20" />
        </svg>
      )}
      {type === 'share' && (
        <svg
          className="w-7 h-7 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.59 13.51 6.83 3.98" />
          <path d="m15.41 6.51-6.82 3.98" />
        </svg>
      )}
    </div>
  );
}

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // khi dùng API: const achievements = dataFromApi;
  const achievements = mockAchievements;

  const filteredAchievements =
    selectedCategory === 'all'
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const unlockedCount = calculateUnlockedCount(achievements);
  const totalPoints = calculateTotalPoints(achievements);
  const currentRank = calculateRank(totalPoints);
  const { nextRank, pointsToNext } = getNextRankInfo(totalPoints);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thành tựu</h1>
          <p className="text-gray-600 mt-1">
            Hoàn thành thử thách và nhận phần thưởng
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <CardContent className="p-6">
              <p className="text-blue-100 mb-2">Thành tựu đã mở</p>
              <p className="text-3xl font-bold">
                {unlockedCount}/{achievements.length}
              </p>
              <div className="mt-3 bg-white/20 rounded-full h-2">
                <div
                    className="bg-white rounded-full h-2 transition-all"
                    style={{
                      width: `${(unlockedCount / achievements.length) * 100}%`,
                    }}
                  />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-2">Tổng điểm</p>
              <p className="text-3xl font-bold text-gray-900">
                {totalPoints}
              </p>
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                <svg
                  className="w-4 h-4 text-yellow-500 fill-yellow-500"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="none"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Điểm thưởng
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-2">Hạng hiện tại</p>
              <p className="text-3xl font-bold text-gray-900">
                {currentRank.name}
              </p>
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                <svg
                  className="w-4 h-4 text-amber-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
                {nextRank
                  ? `Cần ${pointsToNext} điểm để lên ${nextRank}`
                  : 'Bạn đã ở hạng cao nhất'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <Card className="w-fit">
          <CardContent className="p-1 flex gap-2">
            <Button
              size="sm"
              variant={selectedCategory === 'all' ? 'primary' : 'ghost'}
              onClick={() => setSelectedCategory('all')}
            >
              Tất cả ({achievements.length})
            </Button>
            {Object.entries(categoryConfig).map(([key, config]) => {
              const count = achievements.filter(
                (a) => a.category === key
              ).length;
              return (
                <Button
                  key={key}
                  size="sm"
                  variant={selectedCategory === key ? 'primary' : 'ghost'}
                  onClick={() => setSelectedCategory(key)}
                >
                  {config.label} ({count})
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map((achievement) => {
            const percent = calculateAchievementPercent(achievement);

            return (
              <Card
                key={achievement.id}
                className={`transition-all ${
                  achievement.unlocked
                    ? 'border-2 border-green-200 hover:shadow-lg'
                    : 'border border-gray-200 hover:shadow-md opacity-90'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <AchievementIcon
                      type={achievement.icon}
                      unlocked={achievement.unlocked}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {achievement.title}
                        </h3>
                        {achievement.unlocked && (
                          <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                            <svg
                              className="w-3.5 h-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                            Đã mở
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {achievement.description}
                      </p>

                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">
                            {formatProgressNumber(achievement.progress)} /{' '}
                            {formatProgressNumber(achievement.total)}
                          </span>
                          <span className="font-medium text-gray-900">
                            {Math.round(percent)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              achievement.unlocked
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : 'bg-gradient-to-r from-blue-500 to-purple-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <Badge
                          className={
                            categoryConfig[achievement.category].color
                          }
                        >
                          {categoryConfig[achievement.category].label}
                        </Badge>
                        {achievement.reward && (
                          <span className="text-sm font-medium text-yellow-600 flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                              <path d="m9 17 7-7" />
                              <circle cx="12" cy="12" r="10" />
                            </svg>
                            {achievement.reward}
                          </span>
                        )}
                      </div>

                      {achievement.unlockedDate && (
                        <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                          <svg
                            className="w-3.5 h-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                          </svg>
                          <span>
                            Đạt được:{' '}
                            {new Date(
                              achievement.unlockedDate
                            ).toLocaleDateString('vi-VN')}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
