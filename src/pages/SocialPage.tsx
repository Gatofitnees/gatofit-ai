
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Users, TrendingUp } from 'lucide-react';
import { Card, CardBody } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Avatar from '@/components/Avatar';
import RankBadge from '@/components/RankBadge';
import { useRankings } from '@/hooks/useRankings';
import { useUserStats } from '@/hooks/useUserStats';
import { useAuth } from '@/contexts/AuthContext';

const SocialPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { rankings, isLoading } = useRankings();
  const { user } = useAuth();
  const { stats } = useUserStats(user?.id);
  const navigate = useNavigate();

  // Filter users based on search query
  const filteredUsers = rankings.filter(rankingUser => 
    rankingUser.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topUsers = rankings.slice(0, 5);

  const handleUserClick = (userId: string) => {
    navigate(`/public-profile/${userId}`);
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">Social</h1>
      
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar usuarios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardBody className="text-center py-4">
            <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{stats?.followers_count || 0}</div>
            <div className="text-sm text-muted-foreground">Seguidores</div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center py-4">
            <UserPlus className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{stats?.following_count || 0}</div>
            <div className="text-sm text-muted-foreground">Siguiendo</div>
          </CardBody>
        </Card>
      </div>

      {/* Top Users */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Top Usuarios</h3>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="w-24 h-3 bg-muted rounded mb-1" />
                    <div className="w-16 h-2 bg-muted rounded" />
                  </div>
                  <div className="w-12 h-6 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {topUsers.map((rankingUser, index) => (
                <div 
                  key={rankingUser.user_id} 
                  className="flex items-center gap-3 cursor-pointer hover:bg-muted/20 rounded-lg p-2 -m-2 transition-colors"
                  onClick={() => handleUserClick(rankingUser.user_id)}
                >
                  <div className="flex items-center gap-2 min-w-[32px]">
                    <span className="text-sm font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                  </div>
                  
                  <Avatar
                    name={rankingUser.username}
                    size="sm"
                    src={rankingUser.avatar_url}
                  />
                  
                  <div className="flex-1">
                    <p className="font-medium text-sm">{rankingUser.username}</p>
                    <RankBadge level={rankingUser.current_level} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Search Results */}
      {searchQuery && (
        <Card>
          <CardBody>
            <h3 className="font-semibold mb-4">Resultados de búsqueda</h3>
            
            {filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No se encontraron usuarios
              </p>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((rankingUser) => (
                  <div 
                    key={rankingUser.user_id} 
                    className="flex items-center gap-3 cursor-pointer hover:bg-muted/20 rounded-lg p-2 -m-2 transition-colors"
                    onClick={() => handleUserClick(rankingUser.user_id)}
                  >
                    <Avatar
                      name={rankingUser.username}
                      size="sm"
                      src={rankingUser.avatar_url}
                    />
                    
                    <div className="flex-1">
                      <p className="font-medium text-sm">{rankingUser.username}</p>
                      <div className="flex items-center gap-2">
                        <RankBadge level={rankingUser.current_level} size="sm" />
                        <span className="text-xs text-muted-foreground">
                          {rankingUser.current_streak} días racha
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default SocialPage;
