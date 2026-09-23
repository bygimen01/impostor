import {describe,expect,it} from 'vitest'
import {GetAutomaticImpostorCount,ResolveVotes,WeightedPick} from '../engine'
import type {GameState} from '../types'
describe('game engine',()=>{it('calculates impostors',()=>{expect(GetAutomaticImpostorCount(3)).toBe(1);expect(GetAutomaticImpostorCount(8)).toBe(2);expect(GetAutomaticImpostorCount(12)).toBe(3)});it('uses weights',()=>{expect(WeightedPick(['a','b'],Value=>Value==='a'?0:1,.2)).toBe('b')});it('detects tie',()=>{const State={Round:{Votes:{a:'x',b:'y'}}} as unknown as GameState;expect(ResolveVotes(State).IsTie).toBe(true)})})
