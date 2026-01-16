import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

type Priority = 'low' | 'medium' | 'high';
type Status = 'todo' | 'in-progress' | 'done';

interface Task {
  id: string;
  title: string;
  priority: Priority;
  status: Status;
  createdAt: Date;
  completedAt?: Date;
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  high: 'bg-red-100 text-red-800 hover:bg-red-200',
};

const statusColors = {
  'todo': 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-purple-100 text-purple-800',
  'done': 'bg-green-100 text-green-800',
};

const statusLabels = {
  'todo': 'К выполнению',
  'in-progress': 'В работе',
  'done': 'Завершено',
};

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Подготовить презентацию',
      priority: 'high',
      status: 'in-progress',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Проверить почту',
      priority: 'low',
      status: 'done',
      createdAt: new Date('2024-01-14'),
      completedAt: new Date('2024-01-15'),
    },
    {
      id: '3',
      title: 'Созвон с командой',
      priority: 'medium',
      status: 'todo',
      createdAt: new Date('2024-01-16'),
    },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      priority: newTaskPriority,
      status: 'todo',
      createdAt: new Date(),
    };

    setTasks([task, ...tasks]);
    setNewTaskTitle('');
    setNewTaskPriority('medium');
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id !== id) return task;

      let newStatus: Status;
      if (task.status === 'todo') newStatus = 'in-progress';
      else if (task.status === 'in-progress') newStatus = 'done';
      else newStatus = 'todo';

      return {
        ...task,
        status: newStatus,
        completedAt: newStatus === 'done' ? new Date() : undefined,
      };
    }));
  };

  const changePriority = (id: string, priority: Priority) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, priority } : task
    ));
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    return true;
  });

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Всего задач</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">К выполнению</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{stats.todo}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">В работе</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Завершено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.done}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Добавить задачу</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Название задачи..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              className="flex-1"
            />
            <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as Priority)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Низкий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addTask}>
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Список задач</CardTitle>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as Status | 'all')}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="todo">К выполнению</SelectItem>
                  <SelectItem value="in-progress">В работе</SelectItem>
                  <SelectItem value="done">Завершено</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as Priority | 'all')}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Приоритет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все приоритеты</SelectItem>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="Inbox" size={48} className="mx-auto mb-3 opacity-30" />
                <p>Нет задач с выбранными фильтрами</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={task.status === 'done'}
                    onCheckedChange={() => toggleTaskStatus(task.id)}
                    className="h-5 w-5"
                  />

                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.createdAt.toLocaleDateString('ru-RU')}
                      {task.completedAt && ` • Завершено ${task.completedAt.toLocaleDateString('ru-RU')}`}
                    </p>
                  </div>

                  <Badge className={statusColors[task.status]} variant="secondary">
                    {statusLabels[task.status]}
                  </Badge>

                  <Select value={task.priority} onValueChange={(v) => changePriority(task.id, v as Priority)}>
                    <SelectTrigger className={`w-[120px] ${priorityColors[task.priority]}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Низкий</SelectItem>
                      <SelectItem value="medium">Средний</SelectItem>
                      <SelectItem value="high">Высокий</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleTaskStatus(task.id)}
                    className="shrink-0"
                  >
                    <Icon name="CheckCircle2" size={18} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                    className="shrink-0 text-destructive hover:text-destructive"
                  >
                    <Icon name="Trash2" size={18} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
