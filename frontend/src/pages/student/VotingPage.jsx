import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, Clock, CheckCircle, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Countdown from 'react-countdown';
import { voteAPI } from '../../services/api';
import { getSocket, joinMenuRoom, leaveMenuRoom } from '../../services/socket';
import { VoteBar, StatusBadge, SkeletonCard, EmptyState, PageHeader } from '../../components/common/index';
import { format } from 'date-fns';

export default function VotingPage() {
  const queryClient = useQueryClient();
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [selectedSabji, setSelectedSabji] = useState([]);
  const [selectedSweet, setSelectedSweet] = useState(null);
  const [selectedDal, setSelectedDal] = useState(null);
  const [selectedRoti, setSelectedRoti] = useState(null);
  const [liveData, setLiveData] = useState({});

  const { data: menus, isLoading } = useQuery({
    queryKey: ['voting-menus'],
    queryFn: () => voteAPI.getTodayMenus().then(r => r.data.data),
    refetchInterval: 30000,
  });

  const selectedMenu = menus?.find(m => m._id === selectedMenuId) || menus?.[0];

  const { data: voteData, isLoading: voteLoading } = useQuery({
    queryKey: ['menu-votes', selectedMenu?._id],
    queryFn: () => voteAPI.getMenuVotes(selectedMenu._id).then(r => r.data.data),
    enabled: !!selectedMenu?._id,
  });

  // Real-time updates via socket
  useEffect(() => {
    if (!selectedMenu?._id) return;
    const socket = getSocket();
    if (!socket) return;

    joinMenuRoom(selectedMenu._id);

    socket.on('vote_update', (data) => {
      if (data.menuId === selectedMenu._id) {
        setLiveData(prev => ({
          ...prev,
          [data.menuId]: {
            sabjiOptions: data.sabjiOptions,
            sweetDishOptions: data.sweetDishOptions,
            totalVotesCast: data.totalVotesCast,
          }
        }));
      }
    });

    socket.on('menu_finalized', (data) => {
      if (data.menuId === selectedMenu._id) {
        toast.success('🎉 Menu finalized! Voting has closed.');
        queryClient.invalidateQueries(['voting-menus']);
        queryClient.invalidateQueries(['menu-votes', selectedMenu._id]);
      }
    });

    return () => {
      leaveMenuRoom(selectedMenu._id);
      socket.off('vote_update');
      socket.off('menu_finalized');
    };
  }, [selectedMenu?._id]);

  // Initialize selections from user's previous vote
  useEffect(() => {
    if (voteData?.userVote) {
      setSelectedSabji(voteData.userVote.selectedSabji?.map(id => id.toString()) || []);
      setSelectedSweet(voteData.userVote.selectedSweetDish?.toString());
      setSelectedDal(voteData.userVote.selectedDal?.toString());
      setSelectedRoti(voteData.userVote.selectedRotiRice?.toString());
    }
  }, [voteData]);

  const castVoteMutation = useMutation({
    mutationFn: (data) => voteAPI.castVote(data),
    onSuccess: () => {
      toast.success('✅ Vote cast successfully!');
      queryClient.invalidateQueries(['menu-votes', selectedMenu._id]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to cast vote'),
  });

  const toggleSabji = (id) => {
    setSelectedSabji(prev => {
      if (prev.includes(id)) return prev.filter(s => s !== id);
      if (prev.length >= 3) { toast.error('You can select max 3 sabji options'); return prev; }
      return [...prev, id];
    });
  };

  const handleVote = () => {
    if (selectedSabji.length === 0) return toast.error('Please select at least 1 sabji');
    if (!selectedSweet) return toast.error('Please select a sweet dish');
    castVoteMutation.mutate({
      menuId: selectedMenu._id,
      selectedSabji,
      selectedSweetDish: selectedSweet,
      selectedDal,
      selectedRotiRice: selectedRoti,
    });
  };

  const menu = selectedMenu;
  const live = liveData[menu?._id];
  const sabjiOpts = live?.sabjiOptions || voteData?.sabjiOptions || menu?.sabjiOptions || [];
  const sweetOpts = live?.sweetDishOptions || voteData?.sweetDishOptions || menu?.sweetDishOptions || [];
  const dalOpts = voteData?.dalOptions || menu?.dalOptions || [];
  const rotiOpts = voteData?.rotiRiceOptions || menu?.rotiRiceOptions || [];
  const totalVotes = live?.totalVotesCast ?? voteData?.totalVotesCast ?? 0;
  const isOpen = menu?.status === 'voting_open';
  const hasVoted = !!voteData?.userVote;

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Today's Voting" subtitle="Vote for your evening meal" />
        <div className="grid md:grid-cols-2 gap-4">{[1,2].map(i => <SkeletonCard key={i} />)}</div>
      </div>
    );
  }

  if (!menus?.length) {
    return (
      <div>
        <PageHeader title="Today's Voting" />
        <EmptyState icon="🗳️" title="No menus available" description="Providers haven't posted today's menu yet. Come back after 3 PM!" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Vote for Tonight's Menu" subtitle={`Vote closes at 7:00 PM • ${totalVotes} votes cast`} />

      {/* Provider tabs */}
      {menus.length > 1 && (
        <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar pb-2">
          {menus.map(m => (
            <button key={m._id} onClick={() => setSelectedMenuId(m._id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                (selectedMenuId || menus[0]._id) === m._id
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
              }`}>
              {m.provider?.businessName}
              <StatusBadge status={m.status} />
            </button>
          ))}
        </div>
      )}

      {menu && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Voting Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Banner */}
            <div className={`p-4 rounded-2xl border-2 ${isOpen ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <><span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" /><span className="text-green-700 dark:text-green-400 font-semibold text-sm">Voting is LIVE!</span></>
                  ) : (
                    <><AlertCircle size={16} className="text-gray-500" /><span className="text-gray-500 font-semibold text-sm">Voting {menu.status === 'finalized' ? 'closed — Menu finalized!' : 'not open yet'}</span></>
                  )}
                </div>
                {isOpen && menu.votingCloseAt && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <Clock size={14} />
                    <Countdown
                      date={new Date(menu.votingCloseAt)}
                      renderer={({ hours, minutes, seconds }) => (
                        <span className="font-mono font-bold text-primary-600">{hours.toString().padStart(2,'0')}:{minutes.toString().padStart(2,'0')}:{seconds.toString().padStart(2,'0')}</span>
                      )}
                    />
                  </div>
                )}
              </div>
              {hasVoted && (
                <div className="flex items-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle size={15} /> Your vote has been recorded! You can change it anytime before 7 PM.
                </div>
              )}
            </div>

            {/* Sabji Voting */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">🥬 Choose Sabji</h3>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">Select up to 3</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {sabjiOpts.map(sabji => (
                  <motion.div
                    key={sabji._id}
                    whileHover={{ scale: isOpen ? 1.02 : 1 }}
                    whileTap={{ scale: isOpen ? 0.98 : 1 }}
                    onClick={() => isOpen && toggleSabji(sabji._id.toString())}
                    className={`cursor-pointer ${!isOpen && 'cursor-default'}`}
                  >
                    <VoteBar
                      name={sabji.name}
                      count={sabji.voteCount}
                      total={totalVotes || 1}
                      selected={selectedSabji.includes(sabji._id.toString())}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Sweet Dish */}
            <div className="card p-5">
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-4">🍬 Sweet Dish</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {sweetOpts.map(sweet => (
                  <motion.div key={sweet._id} whileHover={{ scale: isOpen ? 1.02 : 1 }} whileTap={{ scale: isOpen ? 0.98 : 1 }}
                    onClick={() => isOpen && setSelectedSweet(sweet._id.toString())} className={`cursor-pointer ${!isOpen && 'cursor-default'}`}>
                    <VoteBar name={sweet.name} count={sweet.voteCount} total={totalVotes || 1} selected={selectedSweet === sweet._id.toString()} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Dal & Roti */}
            {dalOpts.length > 0 && (
              <div className="card p-5">
                <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-4">🫕 Dal</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {dalOpts.map(dal => (
                    <button key={dal._id} onClick={() => isOpen && setSelectedDal(dal._id.toString())}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${selectedDal === dal._id.toString() ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-200'}`}>
                      {dal.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            {isOpen && (
              <button onClick={handleVote} disabled={castVoteMutation.isPending || selectedSabji.length === 0 || !selectedSweet}
                className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
                {castVoteMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <Vote size={20} />}
                {hasVoted ? 'Update My Vote' : 'Cast My Vote'} ({selectedSabji.length}/3 sabji selected)
              </button>
            )}
          </div>

          {/* Summary Panel */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">📊 Live Results</h3>
              <div className="text-center mb-4">
                <p className="text-4xl font-bold text-primary-600">{totalVotes}</p>
                <p className="text-sm text-gray-500">total votes</p>
              </div>

              {menu.status === 'finalized' && voteData?.finalizedMenu && (
                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <p className="text-sm font-bold text-green-700 dark:text-green-400 mb-2">✅ Final Menu:</p>
                  <div className="space-y-1.5">
                    {sabjiOpts.filter(s => voteData.finalizedMenu.selectedSabji?.includes(s._id.toString())).map(s => (
                      <p key={s._id} className="text-xs text-green-700 dark:text-green-300 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" />{s.name}</p>
                    ))}
                    {sweetOpts.find(s => s._id.toString() === voteData.finalizedMenu.selectedSweetDish?.toString()) && (
                      <p className="text-xs text-green-700 dark:text-green-300 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-pink-400 rounded-full" />🍬 {sweetOpts.find(s => s._id.toString() === voteData.finalizedMenu.selectedSweetDish?.toString())?.name}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Price</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{menu.finalPrice || menu.basePrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className="text-gray-600 dark:text-gray-400">8–9 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Chef</span>
                  <span className="text-gray-600 dark:text-gray-400">{menu.provider?.businessName}</span>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-primary-500" /> Top Voted
              </h3>
              <div className="space-y-2">
                {[...sabjiOpts].sort((a, b) => b.voteCount - a.voteCount).slice(0, 3).map((s, i) => (
                  <div key={s._id} className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-600'}`}>{i + 1}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{s.name}</span>
                    <span className="text-xs font-bold text-primary-600">{s.voteCount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
