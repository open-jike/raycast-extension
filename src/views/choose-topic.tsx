import { Action, ActionPanel, Icon, List, useNavigation } from '@raycast/api'
import { isSuccess } from 'jike-sdk'
import { useEffect, useState } from 'react'
import { useUser } from '../hooks/user'
import { pictureWithCircle } from '../utils/icon'
import type { Entity } from 'jike-sdk'
import type { ConfigUser } from '../utils/config'

export const ChooseTopic: React.FC<{
  user: ConfigUser
  onSelect: (topic: Entity.Topic) => void
}> = ({ user, onSelect }) => {
  const { pop } = useNavigation()
  const { client } = useUser(user)

  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [items, setItems] = useState<Entity.Topic[]>([])

  const searchTopic = async () => {
    const response = await client.apiClient.topics.search(searchText)
    if (!isSuccess(response)) return
    const items = response.data.data
    setItems(items)
  }

  useEffect(() => {
    if (!searchText.trim()) {
      setItems([])
      return
    }
    setLoading(true)
    searchTopic().finally(() => setLoading(false))
  }, [searchText])

  return (
    <List
      enableFiltering={false}
      navigationTitle="搜索圈子"
      searchBarPlaceholder="输入圈子关键词"
      throttle
      onSearchTextChange={(newValue) => setSearchText(newValue)}
      isLoading={loading}
    >
      {searchText.trim().length === 0 ? (
        <List.EmptyView title="输入圈子关键词" />
      ) : items.length === 0 ? (
        <List.EmptyView title={loading ? '搜索中...' : '未找到圈子'} />
      ) : (
        items.map((topic) => (
          <List.Item
            key={topic.id}
            icon={pictureWithCircle(topic.squarePicture.smallPicUrl)}
            title={topic.content}
            subtitle={topic.subscribersDescription}
            accessories={[{ text: `${topic.subscribersCount} 人加入` }]}
            actions={
              <ActionPanel>
                <Action
                  icon={Icon.Check}
                  title="Choose"
                  onAction={() => {
                    onSelect(topic)
                    pop()
                  }}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  )
}
