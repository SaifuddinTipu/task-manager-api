import { Task } from '../models/Task';
import { getIO } from '../sockets/task.socket';

export async function create(userId: string, dto: any) {
  const task = await Task.create({ ...dto, userId });
  try { getIO().to(userId).emit('task:created', task); } catch {}
  return task;
}

export async function findAll(userId: string, query: any) {
  const { status, priority, search, tags, dueBefore, sort = 'createdAt', order = 'desc', page = 1, limit = 20 } = query;
  const filter: any = { userId, deletedAt: null };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) filter.title = { $regex: search, $options: 'i' };
  if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
  if (dueBefore) filter.dueDate = { $lte: new Date(dueBefore) };

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;
  const sortObj: any = { [sort]: order === 'asc' ? 1 : -1 };

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sortObj).skip(skip).limit(limitNum),
    Task.countDocuments(filter),
  ]);

  return { tasks, total, page: pageNum, totalPages: Math.ceil(total / limitNum) };
}

export async function findOne(id: string, userId: string) {
  const task = await Task.findOne({ _id: id, userId, deletedAt: null });
  if (!task) throw { status: 404, message: 'Task not found' };
  return task;
}

export async function update(id: string, userId: string, dto: any) {
  const task = await findOne(id, userId);
  Object.assign(task, dto);
  await task.save();
  try { getIO().to(userId).emit('task:updated', task); } catch {}
  return task;
}

export async function softDelete(id: string, userId: string) {
  const task = await findOne(id, userId);
  task.deletedAt = new Date();
  await task.save();
  try { getIO().to(userId).emit('task:deleted', { taskId: id }); } catch {}
}

export async function getStats(userId: string) {
  const [total, byStatusArr, byPriorityArr, overdue] = await Promise.all([
    Task.countDocuments({ userId, deletedAt: null }),
    Task.aggregate([
      { $match: { userId: userId, deletedAt: null } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Task.aggregate([
      { $match: { userId: userId, deletedAt: null } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Task.countDocuments({
      userId,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' },
      deletedAt: null,
    }),
  ]);

  const byStatus: any = {};
  byStatusArr.forEach((s) => { byStatus[s._id] = s.count; });
  const byPriority: any = {};
  byPriorityArr.forEach((p) => { byPriority[p._id] = p.count; });

  return { total, byStatus, byPriority, overdue };
}
