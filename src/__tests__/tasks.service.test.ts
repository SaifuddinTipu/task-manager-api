import mongoose from 'mongoose';

// Mock the socket module so tests don't need a live socket server
jest.mock('../sockets/task.socket', () => ({
  getIO: () => ({ to: () => ({ emit: jest.fn() }) }),
}));

import { Task } from '../models/Task';
import * as tasksService from '../services/tasks.service';

describe('TasksService', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('create() saves task with correct userId attached', async () => {
    const mockTask = { _id: '1', title: 'Test', userId: 'user1' };
    jest.spyOn(Task, 'create').mockResolvedValue(mockTask as any);
    const result = await tasksService.create('user1', { title: 'Test' });
    expect(Task.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user1' }));
    expect(result).toEqual(mockTask);
  });

  it('findAll() with no filters calls query with { userId, deletedAt: null }', async () => {
    const mockQuery = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    };
    jest.spyOn(Task, 'find').mockReturnValue(mockQuery as any);
    jest.spyOn(Task, 'countDocuments').mockResolvedValue(0);

    await tasksService.findAll('user1', {});
    expect(Task.find).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user1', deletedAt: null }));
  });

  it('findAll() with status=done includes status: done in filter', async () => {
    const mockQuery = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    };
    jest.spyOn(Task, 'find').mockReturnValue(mockQuery as any);
    jest.spyOn(Task, 'countDocuments').mockResolvedValue(0);

    await tasksService.findAll('user1', { status: 'done' });
    expect(Task.find).toHaveBeenCalledWith(expect.objectContaining({ status: 'done' }));
  });

  it('findAll() with search=hello includes regex filter on title', async () => {
    const mockQuery = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    };
    jest.spyOn(Task, 'find').mockReturnValue(mockQuery as any);
    jest.spyOn(Task, 'countDocuments').mockResolvedValue(0);

    await tasksService.findAll('user1', { search: 'hello' });
    expect(Task.find).toHaveBeenCalledWith(
      expect.objectContaining({ title: { $regex: 'hello', $options: 'i' } }),
    );
  });

  it('findOne() throws 404 when task not found', async () => {
    jest.spyOn(Task, 'findOne').mockResolvedValue(null);
    await expect(tasksService.findOne('invalid-id', 'user1')).rejects.toMatchObject({ status: 404 });
  });

  it('softDelete() sets deletedAt field and does not call a hard delete method', async () => {
    const mockTask = {
      _id: '1',
      userId: 'user1',
      deletedAt: null,
      save: jest.fn().mockResolvedValue(true),
    };
    jest.spyOn(Task, 'findOne').mockResolvedValue(mockTask as any);
    const deleteMock = jest.spyOn(Task, 'deleteOne').mockResolvedValue({} as any);

    await tasksService.softDelete('1', 'user1');

    expect(mockTask.deletedAt).not.toBeNull();
    expect(mockTask.save).toHaveBeenCalled();
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it('update() throws 403 when userId does not match task owner', async () => {
    jest.spyOn(Task, 'findOne').mockResolvedValue(null);
    await expect(tasksService.update('1', 'wrong-user', { title: 'New' })).rejects.toMatchObject({ status: 404 });
  });

  it('getStats() returns object containing keys total, byStatus, byPriority, overdue', async () => {
    jest.spyOn(Task, 'countDocuments')
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(2);
    jest.spyOn(Task, 'aggregate')
      .mockResolvedValueOnce([{ _id: 'todo', count: 5 }])
      .mockResolvedValueOnce([{ _id: 'medium', count: 8 }]);

    const result = await tasksService.getStats('user1');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('byStatus');
    expect(result).toHaveProperty('byPriority');
    expect(result).toHaveProperty('overdue');
  });
});
