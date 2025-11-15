import React from 'react';
import { Trophy, Star, Award, Target } from 'lucide-react';

interface GamificationProps {
  gamification: {
    total_score: number;
    level: string;
    level_icon: string;
    breakdown: {
      temperature_score: number;
      carbon_score: number;
      green_infrastructure_score: number;
    };
    achievements: Array<{
      name: string;
      icon: string;
      description: string;
    }>;
    next_level_at: number;
  };
}

const GamificationCard: React.FC<GamificationProps> = ({ gamification }) => {
  const progressPercent = (gamification.total_score / gamification.next_level_at) * 100;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl shadow-lg p-6 border-2 border-purple-200">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold text-purple-900">Your Impact Score</h3>
      </div>

      {/* Score Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 mb-4 text-white text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-5xl">{gamification.level_icon}</span>
          <div className="text-left">
            <p className="text-3xl font-bold">{gamification.total_score}</p>
            <p className="text-sm opacity-90">points</p>
          </div>
        </div>
        <p className="text-xl font-semibold mt-2">{gamification.level}</p>
        
        {/* Progress to next level */}
        {gamification.total_score < 1000 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress to next level</span>
              <span>{gamification.next_level_at - gamification.total_score} points to go</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Score Breakdown */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-purple-200">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-600" />
          Score Breakdown
        </h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">🌡️ Temperature Reduction</span>
              <span className="font-semibold text-purple-600">
                {gamification.breakdown.temperature_score}/300
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 rounded-full h-2"
                style={{ width: `${(gamification.breakdown.temperature_score / 300) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">💨 Carbon Offset</span>
              <span className="font-semibold text-green-600">
                {gamification.breakdown.carbon_score}/300
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 rounded-full h-2"
                style={{ width: `${(gamification.breakdown.carbon_score / 300) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">🌱 Green Infrastructure</span>
              <span className="font-semibold text-emerald-600">
                {gamification.breakdown.green_infrastructure_score}/400
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-emerald-500 rounded-full h-2"
                style={{ width: `${(gamification.breakdown.green_infrastructure_score / 400) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      {gamification.achievements.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-600" />
            Achievements Unlocked ({gamification.achievements.length})
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {gamification.achievements.map((achievement, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200 hover:scale-105 transition-transform"
              >
                <div className="text-center">
                  <span className="text-3xl mb-1 block">{achievement.icon}</span>
                  <p className="text-xs font-semibold text-gray-800">{achievement.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivational Message */}
      <div className="mt-4 p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-center">
        {gamification.total_score >= 900 ? (
          <p className="font-semibold">
            🏆 You're a Climate Champion! Share your achievement!
          </p>
        ) : gamification.total_score >= 700 ? (
          <p className="font-semibold">
            🌟 Amazing work! You're a Green Leader!
          </p>
        ) : gamification.total_score >= 500 ? (
          <p className="font-semibold">
            💚 Great progress! Keep fighting for the climate!
          </p>
        ) : (
          <p className="font-semibold">
            🌱 Every action counts! Increase your impact to unlock more achievements!
          </p>
        )}
      </div>

      {/* Share Button */}
      <button className="w-full mt-3 bg-white text-purple-600 font-semibold py-3 px-4 rounded-lg border-2 border-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
        <Star className="w-5 h-5" />
        Share Your Impact
      </button>
    </div>
  );
};

export default GamificationCard;
