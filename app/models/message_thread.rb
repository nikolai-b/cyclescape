# == Schema Information
#
# Table name: message_threads
#
#  id            :integer         not null, primary key
#  issue_id      :integer
#  created_by_id :integer         not null
#  group_id      :integer
#  title         :string(255)     not null
#  privacy       :string(255)     not null
#  state         :string(255)     not null
#  created_at    :datetime        not null
#  updated_at    :datetime        not null
#

class MessageThread < ActiveRecord::Base
  ALLOWED_PRIVACY = %w(public group)

  belongs_to :created_by, class_name: "User"
  belongs_to :group
  belongs_to :issue
  has_many :messages, foreign_key: "thread_id", autosave: true
  has_many :subscriptions, class_name: "ThreadSubscription", foreign_key: "thread_id", conditions: "deleted_at IS NULL"
  has_many :subscribers, through: :subscriptions, source: :user
  has_many :participants, through: :messages, source: :created_by, uniq: true

  scope :public, where("privacy = 'public'")
  scope :private, where("privacy = 'group'")
  scope :with_messages_from, ->(user) { {joins: :messages, conditions: ["messages.created_by_id = ?", user] } }

  validates :title, :state, :created_by_id, presence: true
  validates :privacy, inclusion: {in: ALLOWED_PRIVACY}

  state_machine :state, initial: :new do
  end

  def private_to_group?
    group_id && privacy == "group"
  end

  def public?
    privacy == "public"
  end
end
