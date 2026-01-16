import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import TaskManager from '@/components/TaskManager';

const dashboardData = [
  { name: 'Янв', value: 4200, target: 4000, users: 240 },
  { name: 'Фев', value: 3800, target: 4200, users: 220 },
  { name: 'Мар', value: 5100, target: 4500, users: 290 },
  { name: 'Апр', value: 6200, target: 5000, users: 350 },
  { name: 'Май', value: 5800, target: 5500, users: 320 },
  { name: 'Июн', value: 7200, target: 6000, users: 410 },
];

const activityData = [
  { day: 'Пн', hours: 6.5 },
  { day: 'Вт', hours: 8.2 },
  { day: 'Ср', hours: 7.8 },
  { day: 'Чт', hours: 9.1 },
  { day: 'Пт', hours: 7.5 },
  { day: 'Сб', hours: 4.2 },
  { day: 'Вс', hours: 3.8 },
];

const categoryData = [
  { category: 'Работа', value: 42 },
  { category: 'Обучение', value: 28 },
  { category: 'Проекты', value: 18 },
  { category: 'Другое', value: 12 },
];

export default function Index() {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Панель управления</h1>
            <p className="text-muted-foreground">Отслеживайте прогресс и анализируйте данные</p>
          </div>
          <Button className="gap-2">
            <Icon name="Download" size={18} />
            Экспорт данных
          </Button>
        </header>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="tasks" className="gap-2">
              <Icon name="CheckSquare" size={16} />
              Задачи
            </TabsTrigger>
            <TabsTrigger value="overview" className="gap-2">
              <Icon name="LayoutDashboard" size={16} />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <Icon name="TrendingUp" size={16} />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <Icon name="User" size={16} />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="help" className="gap-2">
              <Icon name="HelpCircle" size={16} />
              Справка
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="animate-fade-in">
            <TaskManager />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Всего записей</CardTitle>
                  <Icon name="Database" size={20} className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">7,245</div>
                  <p className="text-xs text-muted-foreground mt-1">+12% за месяц</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Активных пользователей</CardTitle>
                  <Icon name="Users" size={20} className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">1,842</div>
                  <p className="text-xs text-muted-foreground mt-1">+8% за неделю</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Средний показатель</CardTitle>
                  <Icon name="Activity" size={20} className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">94.2%</div>
                  <p className="text-xs text-muted-foreground mt-1">+2.1% от цели</p>
                </CardContent>
              </Card>
            </div>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Динамика роста</CardTitle>
                <CardDescription>Показатели за последние 6 месяцев</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboardData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(263, 70%, 60%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(263, 70%, 60%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 90%)" />
                    <XAxis dataKey="name" stroke="hsl(240, 4%, 46%)" />
                    <YAxis stroke="hsl(240, 4%, 46%)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid hsl(240, 6%, 90%)',
                        borderRadius: '0.75rem'
                      }} 
                    />
                    <Area type="monotone" dataKey="value" stroke="hsl(263, 70%, 60%)" fill="url(#colorValue)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 animate-fade-in">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Активность по дням</CardTitle>
                  <CardDescription>Часы работы за последнюю неделю</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 90%)" />
                      <XAxis dataKey="day" stroke="hsl(240, 4%, 46%)" />
                      <YAxis stroke="hsl(240, 4%, 46%)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid hsl(240, 6%, 90%)',
                          borderRadius: '0.75rem'
                        }} 
                      />
                      <Bar dataKey="hours" fill="hsl(263, 70%, 60%)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Распределение по категориям</CardTitle>
                  <CardDescription>Процентное соотношение задач</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 90%)" />
                      <XAxis type="number" stroke="hsl(240, 4%, 46%)" />
                      <YAxis dataKey="category" type="category" stroke="hsl(240, 4%, 46%)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid hsl(240, 6%, 90%)',
                          borderRadius: '0.75rem'
                        }} 
                      />
                      <Bar dataKey="value" fill="hsl(263, 70%, 60%)" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Сравнение целей и результатов</CardTitle>
                <CardDescription>План vs Факт за 6 месяцев</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 90%)" />
                    <XAxis dataKey="name" stroke="hsl(240, 4%, 46%)" />
                    <YAxis stroke="hsl(240, 4%, 46%)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid hsl(240, 6%, 90%)',
                        borderRadius: '0.75rem'
                      }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="target" stroke="hsl(240, 4%, 70%)" strokeWidth={2} strokeDasharray="5 5" name="Цель" />
                    <Line type="monotone" dataKey="value" stroke="hsl(263, 70%, 60%)" strokeWidth={2} name="Результат" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Icon name="Target" size={32} className="text-primary mb-2" />
                  <CardTitle>Выполнено целей</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">87%</div>
                  <p className="text-sm text-muted-foreground">26 из 30 целей достигнуто</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Icon name="Clock" size={32} className="text-primary mb-2" />
                  <CardTitle>Среднее время</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">6.8ч</div>
                  <p className="text-sm text-muted-foreground">в день за последний месяц</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Icon name="TrendingUp" size={32} className="text-primary mb-2" />
                  <CardTitle>Рост эффективности</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">+24%</div>
                  <p className="text-sm text-muted-foreground">по сравнению с прошлым кварталом</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6 animate-fade-in">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-1 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Профиль</CardTitle>
                  <CardDescription>Персональная информация</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
                      <AvatarFallback>ИП</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg">Иван Петров</h3>
                      <p className="text-sm text-muted-foreground">ivan@example.com</p>
                    </div>
                    <Button variant="outline" className="w-full gap-2">
                      <Icon name="Upload" size={16} />
                      Изменить фото
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Регистрация</span>
                      <span className="text-sm font-medium">15 янв. 2024</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Записей</span>
                      <span className="text-sm font-medium">7,245</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Статус</span>
                      <span className="text-sm font-medium text-primary">Активен</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Настройки</CardTitle>
                  <CardDescription>Управление параметрами приложения</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Имя</Label>
                      <Input id="name" defaultValue="Иван Петров" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="ivan@example.com" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Телефон</Label>
                      <Input id="phone" type="tel" placeholder="+7 (999) 123-45-67" className="mt-2" />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications">Уведомления</Label>
                        <p className="text-sm text-muted-foreground">
                          Получать push-уведомления
                        </p>
                      </div>
                      <Switch 
                        id="notifications" 
                        checked={notifications}
                        onCheckedChange={setNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-updates">Email рассылка</Label>
                        <p className="text-sm text-muted-foreground">
                          Получать новости на почту
                        </p>
                      </div>
                      <Switch 
                        id="email-updates"
                        checked={emailUpdates}
                        onCheckedChange={setEmailUpdates}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1">
                      <Icon name="Save" size={16} className="mr-2" />
                      Сохранить изменения
                    </Button>
                    <Button variant="outline">Отмена</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="help" className="space-y-6 animate-fade-in">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Документация и справка</CardTitle>
                <CardDescription>Ответы на часто задаваемые вопросы</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-left">
                      Как экспортировать данные?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Для экспорта данных нажмите кнопку "Экспорт данных" в правом верхнем углу панели управления. 
                      Вы можете выбрать формат экспорта: CSV, JSON или PDF. Все ваши данные будут сохранены с учетом 
                      текущих фильтров и настроек отображения.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-left">
                      Как настроить уведомления?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Перейдите в раздел "Профиль" и найдите блок настроек. Там вы можете включить или отключить 
                      push-уведомления и email рассылку. Изменения применяются автоматически после переключения.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-left">
                      Как читать графики статистики?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      В разделе "Статистика" представлены различные виды графиков. Линейные графики показывают 
                      динамику изменений во времени, столбчатые диаграммы отображают сравнение показателей, 
                      а область под кривой помогает визуализировать накопленные значения.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-left">
                      Как изменить период отображения данных?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      В текущей версии отображаются данные за последние 6 месяцев. Функция выбора произвольного 
                      периода будет добавлена в следующем обновлении. Следите за новостями!
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger className="text-left">
                      Как связаться с поддержкой?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Вы можете написать нам на support@example.com или использовать форму обратной связи в 
                      разделе "Контакты". Мы отвечаем на все обращения в течение 24 часов.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Icon name="BookOpen" size={32} className="text-primary mb-2" />
                  <CardTitle>Руководство</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Подробная инструкция по использованию всех возможностей приложения
                  </p>
                  <Button variant="outline" className="w-full gap-2">
                    <Icon name="ExternalLink" size={16} />
                    Открыть руководство
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Icon name="MessageSquare" size={32} className="text-primary mb-2" />
                  <CardTitle>Обратная связь</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Сообщите нам о проблеме или предложите улучшение
                  </p>
                  <Button variant="outline" className="w-full gap-2">
                    <Icon name="Send" size={16} />
                    Отправить сообщение
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Icon name="Video" size={32} className="text-primary mb-2" />
                  <CardTitle>Видео-уроки</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Смотрите обучающие видео о функционале приложения
                  </p>
                  <Button variant="outline" className="w-full gap-2">
                    <Icon name="Play" size={16} />
                    Перейти к урокам
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}