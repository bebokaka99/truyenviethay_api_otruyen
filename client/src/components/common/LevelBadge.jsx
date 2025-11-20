import React from 'react';
import { RANK_STYLES, getLevelFromExp } from '../../utils/levelSystem';

const LevelBadge = ({ exp = 0, rankStyle = 'default', role = 'user' }) => { 
    
    if (role === 'admin') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white shadow-sm bg-red-600">
                ADMIN
            </span>
        );
    }

    const style = RANK_STYLES[rankStyle] || RANK_STYLES.default;
    const level = getLevelFromExp(exp);
    
    const rankTitle = style.ranks(level);
    const badgeColor = style.color(level);

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ${badgeColor}`}>
            {rankTitle} <span className="opacity-70 ml-1">Lv.{level}</span>
        </span>
    );
};

export default LevelBadge;