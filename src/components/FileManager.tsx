import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const FILES_URL = 'https://functions.poehali.dev/827aa4b6-a9e9-498e-a462-8a1ffa891fd3';

interface FileItem {
  id: number;
  name: string;
  size: number;
  type: string;
  uploaded: string;
  archived: boolean;
  url: string;
}

interface FileManagerProps {
  user: any;
  token: string;
  onLogout: () => void;
}

export default function FileManager({ user, token, onLogout }: FileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(FILES_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.error) {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      } else {
        setFiles(data.files || []);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить файлы', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Ошибка', description: 'Файл слишком большой (макс 10 МБ)', variant: 'destructive' });
      return;
    }

    setUploadProgress(10);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setUploadProgress(30);
        const base64 = (reader.result as string).split(',')[1];

        const response = await fetch(FILES_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            fileName: file.name,
            fileData: base64,
            fileType: file.type,
          }),
        });

        setUploadProgress(80);
        const data = await response.json();

        if (data.error) {
          toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
        } else {
          toast({ title: 'Успешно', description: `Файл ${file.name} загружен` });
          await loadFiles();
        }
      } catch (error) {
        toast({ title: 'Ошибка', description: 'Не удалось загрузить файл', variant: 'destructive' });
      } finally {
        setUploadProgress(0);
        e.target.value = '';
      }
    };

    reader.readAsDataURL(file);
  };

  const archiveFile = async (fileId: number) => {
    try {
      const response = await fetch(FILES_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fileId }),
      });

      const data = await response.json();

      if (data.error) {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      } else {
        toast({ title: 'Успешно', description: 'Файл перемещён в архив' });
        await loadFiles();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось архивировать файл', variant: 'destructive' });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
    return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return 'Image';
    if (type.startsWith('video/')) return 'Video';
    if (type.startsWith('audio/')) return 'Music';
    if (type.includes('pdf')) return 'FileText';
    if (type.includes('zip') || type.includes('rar')) return 'Archive';
    return 'File';
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const activeFiles = files.filter(f => !f.archived);
  const archivedFiles = files.filter(f => f.archived);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Файловый менеджер</h1>
            <p className="text-muted-foreground">
              Добро пожаловать, {user.full_name || user.email}
            </p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <Icon name="LogOut" size={18} className="mr-2" />
            Выйти
          </Button>
        </header>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Всего файлов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{files.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Активных</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{activeFiles.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">В архиве</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">{archivedFiles.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Объём</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatFileSize(totalSize)}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Загрузка файлов</CardTitle>
            <CardDescription>Максимальный размер файла: 10 МБ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={uploadProgress > 0}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Icon name="Upload" size={48} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">Нажмите для выбора файла</p>
                  <p className="text-xs text-muted-foreground">или перетащите файл сюда</p>
                </label>
              </div>

              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-sm text-muted-foreground text-center">Загрузка {uploadProgress}%</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Мои файлы</CardTitle>
              <CardDescription>Список загруженных файлов</CardDescription>
            </div>
            <Button variant="outline" onClick={loadFiles} disabled={isLoading}>
              <Icon name="RefreshCw" size={18} className={isLoading ? 'animate-spin' : ''} />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <Icon name="Loader2" size={48} className="mx-auto mb-3 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Загрузка...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Inbox" size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-muted-foreground">Нет загруженных файлов</p>
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                      <Icon name={getFileIcon(file.type)} size={24} className="text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(file.uploaded).toLocaleDateString('ru-RU')}
                        </span>
                        {file.archived && (
                          <Badge variant="secondary" className="text-xs">Архив</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <Icon name="Download" size={16} className="mr-2" />
                        Скачать
                      </Button>

                      {!file.archived && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => archiveFile(file.id)}
                        >
                          <Icon name="Archive" size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
